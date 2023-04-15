import { useContext } from "react";
import { Helmet } from "react-helmet";
import Sidebar from "../components/Sidebar";
import { DecentraSignContext } from "../context/DecentrasignContext";
import { AiOutlineCheck } from "react-icons/ai";

const VerifyPage = () => {
  const {
    profile,
    address,
    verifyDocument,
    reduceString,
    doc,
    setDoc,
    verificationResult,
  } = useContext(DecentraSignContext);

  return (
    <>
      <Helmet>
        <title>DecentraSign | Verify</title>
      </Helmet>
      <section className="flex h-full">
        <Sidebar username={profile.name} />
        <main className="flex flex-col flex-1 bg-gray-100">
          <div className="flex flex-col px-10 py-3 bg-white w-full">
            <p className="text-xl sm:text-3xl">
              Welcome{" "}
              <span className="font-bold text-blue-500">{profile?.name}</span>
            </p>
            <p>
              Connected as:{" "}
              <span className="text-blue-500 text-sm hover:underline hover:cursor-pointer">
                {reduceString(address)}
              </span>
            </p>
          </div>
          <div className="py-3 px-10 space-y-6">
            <h3 className="text-blue-500 text-3xl font-bold">
              Verify Document Signature
            </h3>

            <form
              encType="multipart/form-data"
              onSubmit={verifyDocument}
              className="space-y-4 max-w-5xl"
            >
              <div className="form-control space-y-2 mt-1">
                <h6 className="text-lg ">Upload Document</h6>
                <input
                  type="file"
                  name="doc"
                  id="doc"
                  onChange={(e) => setDoc(e.target.files[0])}
                  className="file-input border-blue-500 focus:outline-2 focus:outline-blue-500 file:bg-blue-500 
                  file:border-none file:rounded-lg file:outline-none
                  rounded-lg w-full"
                />
              </div>

              <button
                type="submit"
                className="btn bg-blue-500 border-blue-500 hover:bg-blue-800 hover:border-blue-800 no-animation flex items-center space-x-4 normal-case rounded-lg text-center disabled:btn-disabled w-full"
                disabled={!doc}
              >
                <AiOutlineCheck />
                <span>Verify</span>
              </button>
            </form>

            {verificationResult &&
              verificationResult?.data &&
              verificationResult.data?.file && (
                <div className="flex flex-col mt-4 space-y-4 bg-white rounded-lg p-4 ">
                  <h1 className="text-xl text-blue-500 font-bold">
                    Verification Result
                  </h1>

                  <div className="flex items-center justify-between">
                    <div className="flex flex-col space-y-1">
                      <h6 className="text-xl text-[#0c0c0d]">Signature</h6>
                      <p
                        className="text-lg text-blue-500 hover:underline hover:cursor-pointer"
                        onClick={async () =>
                          await copyToClipboard(
                            "Signature",
                            verificationResult?.data.signature
                          )
                        }
                      >
                        {(verificationResult?.data.signature.substr(0, verificationResult?.data.signature.length/2))} <br/>
                        {(verificationResult?.data.signature.substr( verificationResult?.data.signature.length/2))}
                      </p>
                    </div>
                    <div className="flex flex-col space-y-1">
                      <h6 className="text-xl text-[#0c0c0d]">Signer</h6>
                      <p
                        className="text-lg text-blue-500 hover:underline hover:cursor-pointer"
                        onClick={async () =>
                          await copyToClipboard(
                            "Signer Address",
                            verificationResult?.data.signer
                          )
                        }
                      >
                        {(verificationResult?.data.signer)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex flex-col space-y-1">
                      <h6 className="text-xl text-[#0c0c0d]">Status</h6>
                      <p
                        className={`text-lg ${
                          verificationResult?.status === "s_verified"
                            ? "text-success"
                            : "text-warning"
                        }`}
                      >
                        {verificationResult?.status === "s_verified"
                          ? "Document Signed & Signature Verified "
                          : "Document Signed but Signature cannot be Verified "}
                        <span className="text-[#0c0c0d]">
                          ({verificationResult?.status})
                        </span>
                      </p>
                      <p className="text-xl">
                        Signed At:{" "}
                        {new Date(
                          verificationResult.data.signedAt * 1000
                        ).toLocaleString("en-IN")}
                      </p>
                    </div>
                  </div>

                  <a
                    href={verificationResult?.data?.file?.replace(
                      "ipfs://",
                      "https://decentrasign.infura-ipfs.io/ipfs/"
                    )}
                    target="_blank"
                    className="p-3 rounded-lg flex items-center 
                    justify-center text-green-600 border border-green-600 hover:text-gray-50 hover:bg-green-600 transition-all duration-200 cursor-pointer"
                  >
                    View Signed File
                  </a>
                </div>
              )}
          </div>
        </main>
      </section>
    </>
  );
};

export default VerifyPage;
