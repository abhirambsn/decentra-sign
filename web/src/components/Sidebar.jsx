import React, { useContext, useState } from "react";
import {
  AiOutlineCheck,
  AiOutlineDoubleLeft,
  AiOutlineDoubleRight,
} from "react-icons/ai";
import { FaPlus } from "react-icons/fa";
import { MdPayments } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import { BsChevronCompactDown, BsChevronCompactUp } from "react-icons/bs";
import { BiUser, BiLogOut, BiGroup } from "react-icons/bi";
import { DecentraSignContext } from "../context/DecentrasignContext";

const Sidebar = ({ username }) => {
  const [toggle, setToggle] = useState(false);
  const [dropdownToggle, setDropdownToggle] = useState(false);
  const { logout } = useContext(DecentraSignContext);
  const navigate = useNavigate();
  return (
    <aside
      className={`flex flex-col py-3 bg-gray-50 items-center ${
        toggle ? "w-64" : "w-16"
      } h-full sticky top-0`}
    >
      <ul className={`space-y-6 ${toggle && "w-full px-2"} flex-1`}>
        {/* Logo icon in case of mobile and with name in case of desktops */}
        <li
          className="flex items-center justify-center cursor-pointer"
          onClick={() => navigate("/home")}
        >
          <div className="flex items-center space-x-4">
            <img src="/logo.png" className="h-10 w-9 rounded-full" alt="Logo" />
            <p className={`hidden md:${toggle ? "inline" : "hidden"} text-xl`}>
              <span className="font-bold text-blue-600">Decentra</span>
              <span className="text-[#0c0c0d]">Sign</span>
            </p>
          </div>
        </li>

        {/* Add button */}
        <li
          className={`p-2 hover:cursor-pointer hover:bg-blue-800 transition-all duration-100 ${
            toggle ? "rounded-lg" : "rounded-full"
          } ease-in-out text-gray-50 space-x-4 items-center flex justify-center bg-blue-600`}
        >
          <label
            htmlFor={`sign-modal`}
            className="cursor-pointer flex items-center justify-center space-x-4"
          >
            <FaPlus size={20} />
            <span className={`hidden md:${toggle ? "inline" : "hidden"}`}>
              Sign a Document
            </span>
          </label>
        </li>

        <li
          onClick={() => navigate("/verify")}
          className="p-2 hover:cursor-pointer hover:bg-gray-300 transition-all duration-100 rounded-lg text-[#0c0c0d] space-x-4 full items-center flex justify-center bg-gray-100"
        >
          <AiOutlineCheck size={18} />
          <span className={`hidden md:${toggle ? "inline" : "hidden"}`}>
            Verify Document
          </span>
        </li>

        <li
          onClick={() => navigate("/billing")}
          className="p-2 hover:cursor-pointer hover:bg-gray-300 transition-all duration-100 rounded-lg text-[#0c0c0d] space-x-4 full items-center flex justify-center bg-gray-100"
        >
          <MdPayments size={18} />
          <span className={`hidden md:${toggle ? "inline" : "hidden"}`}>
            Usage &amp; Billing
          </span>
        </li>

        <li
          onClick={() => navigate("/groups")}
          className="p-2 hover:cursor-pointer hover:bg-gray-300 transition-all duration-100 rounded-lg text-[#0c0c0d] space-x-4 full items-center flex justify-center bg-gray-100"
        >
          <BiGroup size={18} />
          <span className={`hidden md:${toggle ? "inline" : "hidden"}`}>
            Collective Signing
          </span>
        </li>
      </ul>

      <ul className="space-y-6">
        <li
          className={`hover:cursor-pointer text-[#0c0c0d] ${
            toggle ? "space-x-3" : "space-x-0"
          } full flex flex-col bg-gray-100 ${toggle && "p-2"}`}
        >
          <button
            onClick={() => setDropdownToggle((dt) => !dt)}
            className={`flex items-center justify-center bg-gray-100 ${
              toggle && "p-2"
            } transition-all duration-100 rounded-lg hover:bg-gray-300 space-x-2`}
          >
            <img
              src={`https://api.dicebear.com/5.x/initials/svg?seed=${username}`}
              className={`rounded-lg ${toggle && "p-1"} h-9 w-9`}
            />
            <span
              className={`hidden md:${toggle ? "inline" : "hidden"} text-sm`}
            >
              {username}
            </span>
            <span className={`hidden md:${toggle ? "inline" : "hidden"}`}>
              {dropdownToggle ? (
                <BsChevronCompactUp />
              ) : (
                <BsChevronCompactDown />
              )}
            </span>
          </button>

          {dropdownToggle && (
            <ul className="space-y-1 mt-1">
              <li
                className={`w-full hidden items-center ${
                  toggle ? "py-2" : "p-2"
                } ${
                  toggle ? "justify-start" : "justify-center"
                } bg-gray-100 md:flex hover:cursor-pointer w-full rounded-lg text-[#0c0c0d] transition-all duration-100 hover:bg-gray-300 ${
                  toggle ? "space-x-3" : "space-x-0"
                }`}
              >
                <BiUser size={25} />
                <span className={`hidden md:${toggle ? "inline" : "hidden"}`}>
                  Profile
                </span>
              </li>
              <li
                onClick={logout}
                className={`w-full hidden items-center py-2 ${
                  toggle ? "justify-start" : "justify-center"
                } bg-gray-100 md:flex hover:cursor-pointer rounded-lg text-red-500 transition-all duration-100 hover:bg-gray-300 ${
                  toggle ? "space-x-3" : "space-x-0"
                }`}
              >
                <BiLogOut size={25} />
                <span className={`hidden md:${toggle ? "inline" : "hidden"}`}>
                  Logout
                </span>
              </li>
            </ul>
          )}
        </li>
        <li
          onClick={() => setToggle((tg) => !tg)}
          className="w-full hidden items-center p-2 justify-center bg-gray-100 md:flex hover:cursor-pointer rounded-lg text-[#0c0c0d] transition-all duration-100 hover:bg-gray-300"
        >
          {toggle ? (
            <div className="flex items-center space-x-4">
              <AiOutlineDoubleLeft size={20} />
              <span className={`hidden md:${toggle ? "inline" : "hidden"}`}>
                Hide
              </span>
            </div>
          ) : (
            <div className="flex items-center">
              <AiOutlineDoubleRight size={20} />
            </div>
          )}
        </li>
      </ul>
    </aside>
  );
};

export default Sidebar;
