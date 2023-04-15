import React, { useContext, useState } from "react";
import { Helmet } from "react-helmet";
import { toast } from "react-toastify";
import Header from "../components/Header";
import { DecentraSignContext } from "../context/DecentrasignContext";
import { FaFileDownload, FaSignature } from "react-icons/fa";
import { AiOutlineCheck, AiOutlineShareAlt } from "react-icons/ai";
import Modal from "react-modal";
import ShareModal from "../components/ShareModal";
import Sidebar from "../components/Sidebar";
import DocumentView from "../components/DocumentView";

const HomePage = () => {
  const {
    address,
    profile,
    reduceString,
    signDocument,
    verifyDocument,
    signedDocuments,
    setDoc,
    verificationResult,
    docHash,
    doc,
    sharingEmails,
    setSharingEmails,
    shareDocument,
    sharedDocs,
  } = useContext(DecentraSignContext);

  const onChangeIP = (e) => {
    console.log(e.key, e.target.value);
    if (!(e.key === "Enter")) {
      return;
    }
    const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i;
    const { value } = e.target;

    if (emailRegex.test(value)) {
      setSharingEmails((emails) => [...emails, value]);
    }
  };

  const copyToClipboard = async (property, text) => {
    if (!navigator?.clipboard) {
      toast.error("Clipboard API is not supported in your browser");
    }
    await navigator.clipboard.writeText(text);
    toast.success(`${property} Copied to clipboard`);
  };

  return (
    <>
      <Helmet>
        <title>DecentraSign | Home</title>
      </Helmet>
      {/* <Header authenticated={!!address} /> */}
      <section className="flex h-full">
        <Sidebar username={profile?.name} />
        <main className="flex flex-col flex-1 bg-gray-100">
          {/* User Welcome */}
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
          {/* Flex-Row Container */}
          
          <div className="flex items-start mt-9 flex-col md:flex-row space-y-4 md:space-y-0 space-x-0 md:space-x-8 justify-between px-10 py-3">
            {/* Document Listing */}
            <div className="flex flex-col justify-center w-full space-y-4">
              <h2 className="text-2xl sm:text-3xl text-blue-500 font-bold  ">
                Signed Documents
              </h2>
              {signedDocuments.map((sD, index) => (
                <div key={index}>
                  <DocumentView index={index} doc={sD} />

                  {/* Put this part before </body> tag */}
                  <input
                    type="checkbox"
                    id={`share-modal-${index}`}
                    className="modal-toggle"
                  />
                  <div className="modal modal-bottom sm:modal-middle">
                    <div className="modal-box space-y-3">
                      <h3 className="font-bold text-lg">
                        Share Document to Users
                      </h3>

                      {sharingEmails.length > 0 && (
                        <ol>
                          {sharingEmails.map((eml, idx) => (
                            <li key={idx}>{eml}</li>
                          ))}
                        </ol>
                      )}
                      <input
                        className="input input-accent focus:outline-none w-full rounded-lg"
                        placeholder="Enter Email one by one and press ENTER to add to lsit"
                        onKeyDown={onChangeIP}
                      ></input>
                      <div className="modal-action">
                        <button
                          className="px-4 py-2 rounded-lg flex items-center text-green-600 border border-green-600 hover:text-gray-50 hover:bg-green-600 transition-all duration-200 cursor-pointer"
                          onClick={async () =>
                            await shareDocument(
                              sD.documentHash,
                              Date.now() + 8640000
                            )
                          }
                        >
                          Share
                        </button>
                        <label
                          htmlFor={`share-modal-${index}`}
                          className="btn rounded-lg normal-case btn-ghost"
                        >
                          Close
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Document Listing */}
            <div className="flex flex-col justify-center w-full space-y-4">
              <h2 className="text-2xl sm:text-3xl text-blue-500 font-bold  ">
                Shared Documents
              </h2>
              {sharedDocs.map((sD, index) => (
                <DocumentView
                  index={index}
                  doc={sD}
                  shared={true}
                  key={index}
                />
              ))}
            </div>
          </div>
        </main>
      </section>
    </>
  );
};

export default HomePage;
