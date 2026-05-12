import { NavLink } from "react-router-dom";

import Logo from "../../assets/logo.png";

const AppSidebar = () => {
  return (
    <aside className="app-sidebar">

      {/* LOGO */}
      <div className="sidebar-logo">

        <img
          src={Logo}
          alt="logo"
        />

        <h3>Hematin</h3>

      </div>

      {/* MENU */}
      <div className="sidebar-menu">

        <NavLink
          to="/dashboard"
          className="sidebar-link"
        >
          Dashboard
        </NavLink>

        <NavLink
          to="/transaction"
          className="sidebar-link"
        >
          Transaksi
        </NavLink>

        <NavLink
          to="/report"
          className="sidebar-link"
        >
          Laporan
        </NavLink>

        <NavLink
          to="/settings"
          className="sidebar-link"
        >
          Settings
        </NavLink>

      </div>

    </aside>
  );
};

export default AppSidebar;