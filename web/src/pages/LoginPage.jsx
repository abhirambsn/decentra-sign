import React, { useContext } from "react";
import { Helmet } from "react-helmet";
import { Link } from "react-router-dom";
import { DecentraSignContext } from "../context/DecentrasignContext";

const LoginPage = () => {
  const { connectWallet } = useContext(DecentraSignContext);
  return (
    <>
      <Helmet>
        <title>DecentraSign | Login</title>
      </Helmet>
      {/* <Header /> */}
      <main className="payment-bg h-screen w-screen flex items-center bg-gray-100 justify-center">
        <div className="flex rounded-lg flex-col md:flex-row bg-gray-50">
          {/* Image */}
          <div className="h-0 w-0 md:h-[30rem] md:w-[30rem] p-10">
            <img src="/logo.png" alt="Logo" />
          </div>
          {/* <h1 className="text-3xl text-center text-gray-50 font-bold">Login</h1> put in image */}
          {/* Login form */}
          <div className="w-96 p-10 relative flex flex-col items-center justify-center space-y-4 h-[30rem]">
            <h1 className="text-3xl font-bold text-blue-500 absolute top-10">Login</h1>
            <button onClick={connectWallet} className="px-4 py-2 bg-blue-500 hover:bg-blue-800 text-gray-50 rounded-lg w-full transition-all duration-100 ease-in-out">
              Connect Wallet
            </button>
            <Link to="/register">
              <a className="text-sm hover:underline text-center text-gray-400">
                New User? Register Now
              </a>
            </Link>
          </div>
        </div>
      </main>
    </>
  );
};

export default LoginPage;
