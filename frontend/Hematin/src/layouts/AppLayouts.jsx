import AppNavbar from "../components/application/AppNavbar";
import AppSidebar from "../components/application/AppSidebar";

import "../styles/css/dashboard.css";

import { Outlet } from "react-router-dom";

const AppLayout = () => {
  return (
    <div className="dashboard-app">

      <div className="dashboard-layout">

        {/* SIDEBAR */}
        <div className="desktop-sidebar">
          <AppSidebar />
        </div>

        {/* MAIN */}
        <div className="dashboard-main">

          {/* NAVBAR */}
          <AppNavbar />

          {/* CONTENT */}
          <div className="dashboard-content">
            <Outlet />
          </div>

        </div>

      </div>

    </div>
  );
};

export default AppLayout;