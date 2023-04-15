import React, { useContext } from "react";
import { Helmet } from "react-helmet";
import { Link } from "react-router-dom";
import { DecentraSignContext } from "../context/DecentrasignContext";
import {AiOutlineArrowRight} from "react-icons/ai";

const RegisterPage = () => {
  const { address, createUser, connectWalletForRegistration } =
    useContext(DecentraSignContext);
  const handleSubmit = async (e) => {
    e.preventDefault();
    await createUser(e.target.name.value, e.target.email.value);
  };
  return (
    <>
      <Helmet>
        <title>DecentraSign | Register</title>
      </Helmet>
      <main className="payment-bg h-screen w-screen flex bg-gray-100 items-center justify-center">
        <div className="flex rounded-lg flex-col md:flex-row bg-gray-50">
          {/* Image */}
          <div className="h-0 w-0 md:h-[45rem] md:w-[45rem] p-20">
            <img src="/logo.png" alt="Logo" />
          </div>
          <div className="w-96 p-10 flex flex-col items-center justify-center h-[45rem] space-y-4">
            <h1 className="text-3xl text-blue-500 font-bold">Register</h1>
            <form
            onSubmit={handleSubmit}
              className="flex flex-col space-y-4 "
            >
              <label htmlFor="address">Address</label>
              <input
                type="text"
                name="address"
                placeholder="0x..."
                value={address}
                readOnly
                className="bg-gray-50 text-[#0c0c0f] p-3 rounded-lg focus:outline-none"
              />
              <label htmlFor="name">Name</label>
              <input
                type="text"
                name="name"
                placeholder="Someone"
                className="bg-gray-50 input text-[#0c0c0f] p-3 rounded-lg focus:outline-none"
              />
              <label htmlFor="email">Email</label>
              <input
                type="email"
                name="email"
                placeholder="someone@example.com"
                className="bg-gray-50 text-[#0c0c0f] p-3 rounded-lg focus:outline-none"
              />
              <button
                type="submit"
                disabled={!address}
                className="w-full bg-blue-500 disabled:opacity-50  p-3 text-gray-50 rounded-lg hover:bg-blue-800 transition-all duration-300 drop-shadow-lg flex space-x-4 items-center justify-center"
              >
                <AiOutlineArrowRight size={20} />
                <span className="font-bold">Register</span>
              </button>

              <button onClick={connectWalletForRegistration} className="w-full bg-yellow-600 disabled:opacity-50  p-3 text-gray-50 rounded-lg hover:bg-yellow-900 transition-all duration-300 drop-shadow-lg flex space-x-4 items-center justify-center" type="button" disabled={address}>
                Connect Wallet
              </button>

              <Link to="/login">
                <a className="text-sm hover:underline text-center text-gray-400">
                  Already Registered? Login
                </a>
              </Link>
            </form>
          </div>
        </div>
      </main>
    </>
  );
};

export default RegisterPage;
