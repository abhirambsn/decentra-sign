import React from "react";
import { Link } from "react-router-dom";

const Header = ({ authenticated }) => {
  return (
    <header className="w-full flex items-center justify-between mb-5">
      <div>
        {/* Logo */}
        <p className="text-2xl sm:text-4xl">
          <span className="font-bold text-primary">Decentra</span>
          <span className="text-[#0c0c0d]">Sign</span>
        </p>
      </div>

      {authenticated ? (
        <div className="flex space-x-4 items-center">
          <Link to={"/billing"}>
            <a className="btn normal-case btn-ghost flex items-center rounded-lg">
              Billing
            </a>
          </Link>
          <button className="btn normal-case btn-error flex items-center space-x-4 rounded-xl">
            {/* Icon */}
            <span>Logout</span>
          </button>
        </div>
      ) : (
        <div className="flex space-x-4">
          <Link to={`/login`}>
            <a className="btn btn-primary flex items-center space-x-4">
              {/* Icon */}
              <span>Login</span>
            </a>
          </Link>
        </div>
      )}
    </header>
  );
};

export default Header;
