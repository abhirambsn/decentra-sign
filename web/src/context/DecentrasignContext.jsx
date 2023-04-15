import { createContext, useEffect, useState } from "react";
import { ethers } from "ethers";
import axios from "axios";
import { CONTRACT_ABI, CONTRACT_ADDRESS } from "../lib/constants";
import { hashMessage } from "ethers/lib/utils";
import { toast } from "react-toastify";
import { getItem, removeItem, setItem } from "../lib/session";
import { useLocation, useNavigate } from "react-router-dom";
import { FaSignature } from "react-icons/fa";

export const DecentraSignContext = createContext();

export const DecentraSignProvider = ({ children }) => {
  const [address, setAddress] = useState("");
  const [signedDocuments, setSignedDocuments] = useState([]);
  const [profile, setProfile] = useState([]);
  const [sharingEmails, setSharingEmails] = useState([]);
  const [verificationResult, setVerificationResult] = useState([]);
  const [doc, setDoc] = useState();
  const [sharedDocs, setSharedDocs] = useState([]);
  const [docHash, setDocHash] = useState();
  const [filename, setFilename] = useState("");

  // Modal State Variables
  const [shareModalOpen, setShareModalOpen] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  useEffect(() => {
    (async () => {
      if (!window?.ethereum) {
        alert("Please install MetaMask or any Ethereum Wallet!");
        return;
      }

      const isAuth = await checkAuth();
      console.log("Auth Status:", isAuth);
      if (isAuth) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);

        const signer = provider.getSigner();
        setAddress(await signer.getAddress());
        const contract = new ethers.Contract(
          CONTRACT_ADDRESS,
          CONTRACT_ABI,
          signer
        );
        const dt = await contract.aggregateDocumentsByUser();
        const uData = await contract.getUser();
        setSignedDocuments(dt);
        setProfile(uData);
        await getSharedDocuments(uData);

        if (
          location.pathname === "/login" ||
          location.pathname === "/register"
        ) {
          navigate("/home", { replace: true });
        }
      } else {
        if (
          !location.pathname === "/register" &&
          location.pathname !== "/login"
        ) {
          navigate("/login", { replace: true });
        }
      }
    })();
  }, [address]);

  const reduceString = (str, length = 4) =>
    str.substr(0, length) + "..." + str.substr(-1 * length);

  const connectWalletForRegistration = async () => {
    if (!window?.ethereum) {
      alert("Please install MetaMask or any Ethereum Wallet!");
      return;
    }

    const provider = new ethers.providers.Web3Provider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    const signer = provider.getSigner();
    const timestamp = new Date(Date.now()).toLocaleString("en-IN");
    const authMessage = `Authenticating as ${await signer.getAddress()} at ${timestamp}`;
    const signature = await signer.signMessage(hashMessage(authMessage));
    // Verify
    const recoveredAddress = ethers.utils.verifyMessage(
      hashMessage(authMessage),
      signature
    );

    if (recoveredAddress === (await signer.getAddress())) {
      setAddress(await signer.getAddress());
      toast.success("Wallet Connected!");
    }
  };

  const connectWallet = async () => {
    if (!window?.ethereum) {
      alert("Please install MetaMask or any Ethereum Wallet!");
      return;
    }

    const provider = new ethers.providers.Web3Provider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    const signer = provider.getSigner();
    const timestamp = new Date(Date.now()).toLocaleString("en-IN");
    const authMessage = `Authenticating as ${await signer.getAddress()} at ${timestamp}`;
    const signature = await signer.signMessage(hashMessage(authMessage));
    // Verify
    const recoveredAddress = ethers.utils.verifyMessage(
      hashMessage(authMessage),
      signature
    );

    if (recoveredAddress === (await signer.getAddress())) {
      setAddress(await signer.getAddress());
      setItem(
        "auth",
        JSON.stringify({
          signature,
          address: await signer.getAddress(),
          time: timestamp,
          ttl: 86400000,
        })
      );
      const addr = await signer.getAddress();
      toast.success(`Connected to ${reduceString(addr)}`);
      navigate("/home");
      window.location.reload();
    } else {
      toast.error("Authentication failed");
    }
  };

  const logout = () => {
    removeItem("auth");
    navigate("/login", { replace: true });
  };

  const checkAuth = async () => {
    const data = getItem("auth");
    if (!data) {
      console.log("No Auth");
      return false;
    }
    const parsedData = JSON.parse(data);
    const { signature, ttl, time, address: signerAddr } = parsedData;
    const elapsedTime = Date.now() - time;
    if (elapsedTime > ttl) {
      console.log("Expired Authentication");
      removeItem("auth");
      return false;
    }
    const authMessage = `Authenticating as ${signerAddr} at ${time}`;
    const recoverAddress = ethers.utils.verifyMessage(
      hashMessage(authMessage),
      signature
    );

    if (!window.ethereum) {
      toast.error("Please install MetaMask or any Ethereum Wallet!");
      return false;
    }

    const provider = new ethers.providers.Web3Provider(window.ethereum);
    try {
      const signer = provider.getSigner();
      const address = await signer.getAddress();

      return recoverAddress === address;
    } catch (err) {
      console.warn("Wallet Session Timed out / not initialized", err);
      await provider.send("eth_requestAccounts", []);
      const signer = provider.getSigner();
      const address = await signer.getAddress();
      return recoverAddress === address;
    }
  };

  const signDocument = async (e) => {
    e.preventDefault();
    const form = new FormData();
    form.append("doc", doc, doc.name);
    form.set("name", filename);
    const resp = await axios.post("http://localhost:5000/hash", form);
    setDocHash(resp.data.hash);
    if (!window.ethereum) {
      return;
    }
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();

    const rsp = await axios.post("http://localhost:5000/sign", {
      path: resp.data.path,
      name: profile.name,
      address,
    });
    if (rsp.status === 200) {
      const contract = new ethers.Contract(
        CONTRACT_ADDRESS,
        CONTRACT_ABI,
        signer
      );
      const signature = await signer.signMessage(rsp.data.hash);
      alert("Signature for the above document is:" + signature);
      const txn = await contract.signDocument(
        filename,
        rsp.data.hash,
        rsp.data.ipfsUrl,
        signature
      );
      await txn.wait(1);
      alert("Document signed successfully");
      alert("View Document @ " + rsp.data.ipfsUrl);
      setDocHash("");
    }
  };

  const verifySignatureByBytesHash = async (signature, fileHash, signer) => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const contractSgn = provider.getSigner();
    const contract = new ethers.Contract(
      CONTRACT_ADDRESS,
      CONTRACT_ABI,
      contractSgn
    );
    const strHash = await contract.convertToString(fileHash);
    const recoveredSignerAddr = ethers.utils.recoverAddress(
      hashMessage(strHash),
      signature
    );
    return signer === recoveredSignerAddr;
  };

  const verifySignature = (signature, fileHash, signer) => {
    if (!window.ethereum) {
      alert("Please install MetaMask");
      return;
    }

    const recoveredSignerAddr = ethers.utils.recoverAddress(
      hashMessage(fileHash),
      signature
    );

    return recoveredSignerAddr === signer;
  };

  const createUser = async (name, email) => {
    if (!window.ethereum) {
      return;
    }

    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(
      CONTRACT_ADDRESS,
      CONTRACT_ABI,
      signer
    );
    await contract.createUser(name, email);
  };

  const verifyDocument = async (e) => {
    e.preventDefault();
    const id = toast.loading("Fetching Document...");
    const form = new FormData();
    form.append("doc", doc, doc.name);
    const resp = await axios.post("http://localhost:5000/hash", form, {
      headers: {
        "X-Request-Type": "verify",
      },
    });
    const hash = resp.data.hash;
    if (!window.ethereum) {
      return;
    }
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(
      CONTRACT_ADDRESS,
      CONTRACT_ABI,
      signer
    );
    console.log("FileHash", hash);
    const registeredSignature = await contract.verifyDocumentSignature(hash);
    if (registeredSignature.isVerified) {
      toast.update(id, {
        render: "Signed Document Found...",
        type: "info",
        isLoading: true,
      });
      const signatureVerified = verifySignature(
        registeredSignature.doc.signature,
        hash,
        registeredSignature.doc.signer
      );

      let result = {
        signature: registeredSignature.doc.signature,
        signer: registeredSignature.doc.signer,
        file: registeredSignature.doc.uri,
        signedAt: registeredSignature.doc.signedAt.toNumber(),
      };

      if (signatureVerified) {
        setVerificationResult({ data: result, status: "s_verified" });
        toast.update(id, {
          render: "Signature Verified",
          type: "success",
          isLoading: false,
          autoClose: 5000,
        });
      } else {
        setVResult({ data: result, status: "s_not_verified" });
        toast.update(id, {
          render: "Signature cannot be Verified",
          type: "error",
          isLoading: false,
          autoClose: 5000,
        });
      }
    } else {
      setVerificationResult({ data: null, status: "not_signed" });
      console.error("Document not Signed");
      toast.update(id, {
        render: "Document Not Signed",
        type: "error",
        isLoading: false,
      });
    }
  };

  const getSharedDocuments = async (userProfile = undefined) => {
    if (!window.ethereum) {
      toast.error("Please install MetaMask or any Ethereum Wallet!");
      return;
    }

    try {
      let resp;
      if (!userProfile) {
        resp = await axios.post("http://localhost:5000/shared", {
          email: profile?.email,
        });
      } else {
        resp = await axios.post("http://localhost:5000/shared", {
          email: userProfile?.email,
        });
      }

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(
        CONTRACT_ADDRESS,
        CONTRACT_ABI,
        signer
      );
      // Set shared docs to state
      let sharedDocsData = resp.data;
      const sharedDoc = await Promise.all(
        sharedDocsData.map(async (doc) => {
          const dt = await contract.getDocumentByHash(doc.hash);
          return {
            ...doc,
            url: dt?.uri,
            signer: dt?.signer,
            signature: dt?.signature,
            name: dt?.name,
          };
        })
      );
      setSharedDocs(sharedDoc);
    } catch (err) {
      console.error(err);
    }
  };

  const shareDocument = async (documentHash) => {
    const id = toast.loading(`Sharing Documents...`);
    try {
      // Axios Sharing Logic
      await axios.post("http://localhost:5000/share", {
        docHash: documentHash,
        to: sharingEmails,
        by: profile.email,
      });

      setSharingEmails([]);

      toast.update(id, {
        render: "Document shared to users",
        type: "success",
        isLoading: false,
        autoClose: 3000,
      });
    } catch (err) {
      toast.update(id, {
        render: "Error Occurred",
        type: "error",
        isLoading: false,
        autoClose: 3000,
      });
      console.error(err);
    }
  };

  return (
    <DecentraSignContext.Provider
      value={{
        address,
        connectWallet,
        signDocument,
        verifySignature,
        createUser,
        verifyDocument,
        reduceString,
        profile,
        signedDocuments,
        verificationResult,
        doc,
        setDoc,
        docHash,
        setDocHash,
        checkAuth,
        shareDocument,
        shareModalOpen,
        setShareModalOpen,
        sharingEmails,
        setSharingEmails,
        sharedDocs,
        logout,
        connectWalletForRegistration,
        verifySignatureByBytesHash,
      }}
    >
      {children}
      <input type="checkbox" id={`sign-modal`} className="modal-toggle" />
      <div className="modal modal-bottom sm:modal-middle">
        <div className="modal-box space-y-3">
          <h3 className="text-center text-blue-500 text-xl sm:text-2xl font-bold">
            Sign Document
          </h3>
          <form
            encType="multipart/form-data"
            onSubmit={signDocument}
            className="space-y-4"
          >
            <div className="flex flex-col sm:flex-row space-y-1 sm:space-y-0 sm:space-x-4">
              <span className="text-lg">Signing As:</span>{" "}
              <span className="text break-all sm:text-lg text-blue-500">
                {address}
              </span>
            </div>

            <div className="form-control space-y-2 mt-1">
              <h6 className="text-lg ">Document Title</h6>

              <input
                type="text"
                name="name"
                id="name"
                placeholder="Somename"
                onChange={(e) => setFilename(e.target.value)}
                className="input border-blue-500 focus:outline-2 focus:outline-blue-500 file:bg-blue-500 file:rounded-lg file:outline-none
                rounded-lg w-full"
              />
            </div>
            <div className="form-control space-y-2 mt-1">
              <h6 className="text-lg ">Upload Document</h6>
              <input
                type="file"
                name="doc"
                id="doc"
                onChange={(e) => setDoc(e.target.files[0])}
                className="file-input border-blue-500 focus:outline-2 focus:outline-blue-500 file:bg-blue-500 file:rounded-lg file:outline-none
                rounded-lg w-full file:border-none"
              />
            </div>

            {docHash && (
              <div className="flex flex-col sm:flex-row space-y-1 sm:space-y-0 sm:space-x-4">
                <p className="text-[#0c0c0d] text-lg">Document Hash</p>
                <span className="text-blue-500 text break-all sm:text-lg">
                  {docHash}
                </span>
              </div>
            )}

            <div className="modal-action">
              <button
                type="submit"
                disabled={!doc}
                className="btn bg-blue-500 border-blue-500 hover:bg-blue-800 hover:border-blue-800 no-animation flex items-center space-x-4 normal-case rounded-lg text-center disabled:btn-disabled"
              >
                <FaSignature size={20} />
                <span>Sign Document</span>
              </button>
              <label
                htmlFor={`sign-modal`}
                className="btn rounded-lg normal-case btn-ghost"
                onClick={() => setDoc(null)}
              >
                Close
              </label>
            </div>
          </form>
        </div>
      </div>
    </DecentraSignContext.Provider>
  );
};
