import { useContext, useLayoutEffect, useState } from "react";
import { ethers } from "ethers";
import axios from "axios";

import { CONTRACT_ABI, CONTRACT_ADDRESS } from "../lib/constants";
import { hashMessage } from "ethers/lib/utils";
import { toast } from "react-toastify";
import { DecentraSignContext } from "../context/DecentrasignContext";

const IndexPage = () => {
  const {
    signDocument,
    verifyDocument,
    reduceString,
    signedDocuments,
    setDoc,
    profile,
    verificationResult,
    docHash,
    address,
    checkAuth
  } = useContext(DecentraSignContext);

  return (
    <div className="h-screen w-screen text-gray-50">
      <form encType="multipart/form-data" onSubmit={signDocument}>
        <div>
          <label htmlFor="doc">Document</label>
          <input type="file" onChange={(e) => setDoc(e.target.files[0])} />
        </div>
        <div>
          <label htmlFor="addr">Signing as</label>
          <input
            type="text"
            name="address"
            id="address"
            readOnly
            value={address}
            className="text-gray-50"
          />
        </div>
        <button type="submit">Sign Document</button>
      </form>

      {docHash && (
        <div>
          <h1>Document Hash</h1>
          <p>{docHash}</p>
        </div>
      )}

      <form onSubmit={verifyDocument} encType="multipart/form-data">
        <h2>Verify Document</h2>
        <div>
          <label htmlFor="doc">Document</label>
          <input
            type="file"
            name="doc"
            id="doc"
            onChange={(e) => setDoc(e.target.files[0])}
          />
        </div>
        <button type="submit">Verify</button>
      </form>

      {signedDocuments.length > 0 && (
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Document URI</th>
              <th>Signature</th>
              <th>Signer</th>
              <th>Token ID</th>
            </tr>
          </thead>
          <tbody>
            {signedDocuments.map((doc, i) => (
              <tr key={i}>
                <td>{i + 1}</td>
                <td>
                  <a
                    href={doc.uri.replace(
                      "ipfs://",
                      "https://decentrasign.infura-ipfs.io/ipfs/"
                    )}
                  >
                    {doc.uri.replace(
                      "ipfs://",
                      "https://decentrasign.infura-ipfs.io/ipfs/"
                    )}
                  </a>
                </td>
                <td>{reduceString(doc.signature)}</td>
                <td>{reduceString(doc.signer)}</td>
                <td>{doc.tokenId?.toNumber()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {verificationResult &&
        verificationResult?.data &&
        verificationResult.data?.file && (
          <div>
            <h1>Verification Result</h1>
            <p>
              File URL:{" "}
              <a
                href={verificationResult?.data?.file?.replace(
                  "ipfs://",
                  "https://decentrasign.infura-ipfs.io/ipfs/"
                )}
              >
                {verificationResult?.data?.file?.replace(
                  "ipfs://",
                  "https://decentrasign.infura-ipfs.io/ipfs/"
                )}
              </a>
            </p>
            <p>Signature: {verificationResult?.data.signature}</p>
            <p>Signer: {verificationResult?.data.signer}</p>
            <p>Status: {verificationResult?.status}</p>
          </div>
        )}
    </div>
  );
};

export default IndexPage;
