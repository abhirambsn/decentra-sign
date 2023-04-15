import React, { useContext, useEffect, useState } from "react";
import { FaSignature, FaFileDownload } from "react-icons/fa";
import { AiOutlineShareAlt } from "react-icons/ai";
import { DecentraSignContext } from "../context/DecentrasignContext";

const DocumentView = ({ index, doc, shared = false }) => {
  const { reduceString, verifySignatureByBytesHash } =
    useContext(DecentraSignContext);
  const [status, setStatus] = useState(null);
  useEffect(() => {
    (async () => {
      console.log(doc);
      let data;
      if (shared) {
        data = await verifySignatureByBytesHash(
          doc.signature,
          doc.hash,
          doc.signer
        );
      } else {
        data = await verifySignatureByBytesHash(
          doc.signature,
          doc.documentHash,
          doc.signer
        );
      }
      setStatus(data);
    })();
  }, []);
  return (
    <div className="flex items-center flex-col space-y-3 w-auto md:w-[40rem] bg-gray-50 p-4 rounded-lg">
      <div className="flex items-center w-full justify-between">
        {/* Doc Name */}
        <span className="text-gray-600 font-bold text-lg">{doc?.name}</span>
        {/* Time of Signing */}
        <span className="hidden md:inline text-gray-600 text-lg">
          {new Date().toLocaleString("en-IN", {
            dateStyle: "short",
            timeStyle: "short",
          })}
        </span>
      </div>
      <div className="flex flex-col md:flex-row items-start md:items-center space-y-2 md:space-y-0 justify-between w-full">
        <div className="flex items-center space-x-3">
          {/* Icon */}
          <div className="bg-gray-300 text-gray-500 flex items-center justify-center rounded-full p-2">
            <FaSignature size={24} />
          </div>
          {/* Address of Signer & Signature of Doc */}
          <div className="flex flex-col space-y-0 text-[#0c0c0d]">
            <span className="text-sm md:text-lg">
              {shared ? doc.by : reduceString(doc.signer, 10)}
            </span>
            <span className="text-sm md:text-lg">
              {reduceString(doc.signature, 10)}
            </span>
          </div>
        </div>
        <div>
          {status !== null && (
            <span
              className={`text-sm md:text-sm p-2 rounded-lg badge ${
                status ? "badge-success" : "badge-warning"
              }`}
            >
              {status ? "Signature Verified" : "Signature Not Verified"}
            </span>
          )}
        </div>
      </div>

      {!shared ? (
        <div className="flex flex-col md:flex-row items-center justify-between space-y-1 md:space-y-0 md:space-x-8 w-full">
          <a
            href={doc.uri.replace(
              "ipfs://",
              "https://decentrasign.infura-ipfs.io/ipfs/"
            )}
            className="px-4 py-2 w-full items-center justify-center rounded-lg flex space-x-4 text-blue-500 border border-blue-500 hover:text-gray-50 hover:bg-blue-600 transition-all duration-200"
            target="_blank"
            referrerPolicy="noopener"
          >
            <FaFileDownload size={20} />
            <span className="hidden md:inline">Download Signed File</span>
          </a>
          <label
            htmlFor={`share-modal-${index}`}
            className="px-4 py-2 w-full rounded-lg items-center justify-center flex space-x-4 text-green-600 border border-green-600 hover:text-gray-50 hover:bg-green-600 transition-all duration-200 cursor-pointer"
          >
            <AiOutlineShareAlt size={20} />
            <span className="hidden md:inline">Share Securely</span>
          </label>
        </div>
      ) : (
        <div className="flex flex-col md:flex-row items-center justify-between space-y-1 md:space-y-0 md:space-x-8 w-full">
          <a
            href={doc.url.replace(
              "ipfs://",
              "https://decentrasign.infura-ipfs.io/ipfs/"
            )}
            className="px-4 py-2 w-full items-center justify-center rounded-lg flex space-x-4 text-blue-500 border border-blue-500 hover:text-gray-50 hover:bg-blue-600 transition-all duration-200"
            target="_blank"
            referrerPolicy="noopener"
          >
            <FaFileDownload size={20} />
            <span className="hidden md:inline">Download Signed File</span>
          </a>
        </div>
      )}
    </div>
  );
};

export default DocumentView;
