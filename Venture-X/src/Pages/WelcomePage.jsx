import React from "react";
import { NavLink, Outlet } from "react-router-dom";
import WelcomeNavbar from "../components/WelcomeNavbar";


const WelcomePage = () => {
  return (
    <div>
      <WelcomeNavbar />
      <div className="max-w-5xl mx-auto p-6">
        <div className=" flex gap-3 flex-wrap">
        </div>
        <Outlet />
      </div>
    </div>
  );
};

export default WelcomePage;
