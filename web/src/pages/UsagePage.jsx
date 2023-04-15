import { ethers } from "ethers";
import React, { useContext, useEffect, useState } from "react";
import { Helmet } from "react-helmet";
import { toast } from "react-toastify";
import Sidebar from "../components/Sidebar";
import { DecentraSignContext } from "../context/DecentrasignContext";
import { CONTRACT_ABI, CONTRACT_ADDRESS } from "../lib/constants";
import PieChart from "../components/PieChart";
import QRCode from "react-qr-code";
import { FaEthereum, FaFileSignature } from "react-icons/fa";
import { BiQrScan } from "react-icons/bi";
import axios from "axios";

const UsagePage = () => {
  const { profile, reduceString, address, sharedDocs } =
    useContext(DecentraSignContext);
  const [usage, setUsage] = useState(0);
  const [total, setTotal] = useState(0);
  const [lastPaymentTime, setLastPaymentTime] = useState(0);
  const [paymentData, setPaymentData] = useState([]);
  const [url, setUrl] = useState("");
  useEffect(() => {
    if (profile.length <= 0) return;
    (async () => {
      const resp = await axios.get(
        `http://localhost:5000/payment-data/${address}`
      );
      setPaymentData(resp.data);
      console.log(resp.data);
      setUsage(profile?.quota?.toNumber());
      setTotal(profile?.signedDocuments?.toNumber());
      setLastPaymentTime(profile?.lastPaymentTime?.toNumber());
      setUrl(urlBuilder());
    })();
  }, [profile]);

  const urlBuilder = () => {
    return `ethereum:pay-${import.meta.env.VITE_CONTRACT_ADDRESS}@${
      import.meta.env.NODE_ENV === "development" ? "80001" : "137"
    }/payForUsage?value=${ethers.utils.parseEther((usage * 0.001).toString())}`;
  };

  const payForUsage = async () => {
    if (!window.ethereum) {
      toast.error("Please install Metamask");
      return;
    }
    const id = toast.loading("Transaction in progress...");
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    let signer;
    try {
      signer = provider.getSigner();
    } catch (error) {
      console.warn(error);
      await provider.request("eth_requestAccounts", []);
      signer = provider.getSigner();
    }

    const contract = new ethers.Contract(
      CONTRACT_ADDRESS,
      CONTRACT_ABI,
      signer
    );
    try {
      console.log("Paying", parseInt(usage) * 0.001);
      const txn = await contract.payForUsage({
        value: ethers.utils.parseEther((parseInt(usage) * 0.001).toString()),
      });
      await txn.wait(1);
      await axios.post("http://localhost:5000/record-payment", {
        user: address,
        paidAt: new Date(),
        amount: parseInt(usage) * 0.001,
        txnHash: txn.hash,
      });

      toast.update(id, {
        render: "Payment Successful",
        type: "success",
        isLoading: false,
        autoClose: 3000,
      });
    } catch (error) {
      console.error(error);
      toast.update(id, {
        render: "Error Occurred! Please Try again.",
        type: "error",
        isLoading: false,
        autoClose: 3000,
      });
    }
  };
  return (
    <>
      <Helmet>
        <title>DecentraSign | Usage &amp; Billing</title>
      </Helmet>
      <section className="flex h-full">
        <Sidebar username={profile?.name} />
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
          <div className="py-3 px-10 m-4 space-y-6 rounded-lg">
            <h3 className="text-blue-500 text-3xl font-bold">
              Usage and Billing
            </h3>

            <div className="h-auto w-full flex items-start space-x-20 justify-center">
              <div className="h-96 flex flex-col items-center rounded-lg bg-gray-50">
                <PieChart
                  data={[
                    {
                      title: "Total Documents Signed",
                      value: total,
                      color: "#3B82F6",
                    },
                    {
                      title: "Documents Shared",
                      value: sharedDocs.length,
                      color: "#22C55E",
                    },
                    {
                      title: "Quota",
                      value: usage,
                      color: "#EAB308",
                    },
                  ]}
                />
              </div>
              <div className="w-full flex flex-col h-full">
                <div className="mb-4 flex flex-col md:flex-row space-y-3 md:space-y-0 md:space-x-4">
                  <div className="p-4 w-96 flex flex-col space-y-5 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-start space-x-6">
                      <div className="bg-blue-500 rounded-full p-3 flex items-center justify-center">
                        <FaFileSignature size={24} className="text-gray-50" />
                      </div>
                      <span className="text-2xl text-[#0c0c0d]">
                        Signed Documents
                      </span>
                    </div>

                    <p className="text-3xl font-bold text-[#0c0c0d]">
                      {usage} Document(s) Signed
                    </p>
                    <ul className="text-[#0c0c0d] font-bold text-xs">
                      <li className="break-words">
                        <span className="text-red-500">* </span>A usage charge
                        of <span>0.001 MATIC</span> will be charged for every
                        signed document and a payment is necessary the end of
                        the month in order for continued usage, these Price is
                        excluding the gas fee of the transaction.
                      </li>
                      <li>
                        <span className="text-red-500">* </span>Document Sharing
                        is free of cost
                      </li>
                    </ul>
                  </div>

                  <div className="p-4 flex flex-col space-y-5 bg-gray-50 rounded-lg">
                    {/* Icon & Label */}
                    <div className="flex items-center justify-start space-x-6">
                      <div className="bg-blue-500 rounded-full p-3 flex items-center justify-center">
                        <FaEthereum size={24} className="text-gray-50" />
                      </div>
                      <span className="text-2xl text-[#0c0c0d]">
                        Upcoming Bill
                      </span>
                    </div>
                    {/* Price */}
                    <p className="text-3xl font-bold text-[#0c0c0d]">
                      {usage * 0.001} MATIC{" "}
                      <span className="text-xs">(excl. Gas Fee)</span>
                    </p>
                    {/* Due Date*/}
                    <p>
                      Due Date:{"  "}
                      <span>
                        {new Date(
                          lastPaymentTime * 1000 + 30 * 24 * 60 * 60 * 1000
                        ).toLocaleString("en-IN", {
                          dateStyle: "full",
                          timeStyle: "short",
                        })}{" "}
                        (
                        {(
                          (new Date(
                            lastPaymentTime * 1000 + 30 * 24 * 60 * 60 * 1000
                          ).getTime() -
                            Date.now()) /
                          (1000 * 60 * 60 * 24)
                        ).toFixed(0)}{" "}
                        days left)
                      </span>
                    </p>
                    <button
                      onClick={payForUsage}
                      className="px-4 py-2 bg-blue-500 hover:bg-blue-800 text-gray-50 transition-all ease-in-out duration-100 rounded-lg flex items-center justify-center"
                    >
                      Pay Now
                    </button>
                    <span className="font-bold text-xl text-[#0c0c0d] text-center">
                      OR
                    </span>
                    <button className="px-4 py-2 bg-green-500 hover:bg-green-800 text-gray-50 transition-all ease-in-out duration-100 rounded-lg flex items-center justify-center">
                      Check for Mobile Payment
                    </button>
                  </div>

                  <div className="flex items-center justify-center">
                    <p className="font-bold text-2xl text-[#0c0c0d]">OR</p>
                  </div>

                  <div className="p-4 flex flex-col space-y-5 items-center justify-center bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-start space-x-6">
                      <div className="bg-blue-500 rounded-full p-3 flex items-center justify-center">
                        <BiQrScan size={24} className="text-gray-50" />
                      </div>
                      <span className="text-2xl text-[#0c0c0d]">
                        Scan QR Code to Pay
                      </span>
                    </div>
                    <QRCode
                      value={url}
                      bgColor={"#FFFFFF"}
                      fgColor={"#000000"}
                    />
                  </div>
                </div>
              </div>
            </div>

            <h3 className="text-blue-500 text-3xl font-bold">
              Past Payments
            </h3>

            <div className="h-auto w-full flex items-center justify-center">
              <table className="table table-zebra w-full">
                {/* head */}
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Date</th>
                    <th>Amount</th>
                    <th>Hash</th>
                  </tr>
                </thead>
                <tbody>
                  {paymentData.map((payment, i) => (
                    <tr key={i}>
                      <th>{i + 1}</th>
                      <td>
                        {new Date(payment.paidAt).toLocaleDateString("en-IN", {
                          dateStyle: "short",
                        })}
                      </td>
                      <td>{payment?.amount} MATIC</td>
                      <td>{reduceString(payment?.txnHash, 6)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </section>
    </>
  );
};

export default UsagePage;
