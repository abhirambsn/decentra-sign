import React from "react";
import { Outlet } from "react-router-dom";
import { DecentraSignProvider } from "./context/DecentrasignContext";

const App = () => {
  return (
    <div className="h-screen w-screen">
      <DecentraSignProvider>
        <Outlet />
      </DecentraSignProvider>
    </div>
  );
};

export default App;
