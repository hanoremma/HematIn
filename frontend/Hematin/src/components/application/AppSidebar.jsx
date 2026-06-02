import { NavLink, useNavigate } from "react-router-dom";

import Logo from "../../assets/logo.png";

import {
  BsGridFill,
  BsWallet2,
  BsReceipt,
  BsTagsFill,
  BsPiggyBankFill,
  BsQuestionCircle,
  BsBoxArrowRight
} from "react-icons/bs";

const AppSidebar = () => {

  const navigate = useNavigate();

  const handleLogout = () => {

    localStorage.removeItem("user");
    localStorage.removeItem("token");

    navigate("/login");

  };

  return (
    <aside className="app-sidebar">

      {/* TOP */}
      <div>

        {/* LOGO */}
        <div className="sidebar-header">

          <img
            src={Logo}
            alt="logo"
            className="sidebar-logo"
          />

          <div>

            <h3>
              <NavLink to="/dashboard">Hematin</NavLink>
            </h3>

            <p>
              Manajemen Keuangan
            </p>

          </div>

        </div>

        {/* MENU */}
        <div className="sidebar-menu">
          
          <NavLink
          to="/dashboard"
          className="sidebar-link"
          >
            
            <BsGridFill />
            <span>Beranda</span>
            </NavLink>
            
            <NavLink
            to="/wallets"
            className="sidebar-link"
            >
            <BsWallet2 />
            <span>Wallet</span>
            </NavLink>
            
            <NavLink
            to="/transactions"
            className="sidebar-link"
            >
              <BsReceipt />
              <span>Transaksi</span>
              </NavLink>
              
              <NavLink
              to="/categories"
              className="sidebar-link"
              >
              <BsTagsFill />
              <span>Kategori</span>
              </NavLink>
              
              <NavLink
              to="/budgets"
              className="sidebar-link"
              >
              <BsPiggyBankFill />
              <span>Budgets</span>
              </NavLink>
              
            </div>

      </div>

      {/* BOTTOM */}
      <div className="sidebar-bottom">
        <button className="sidebar-footer-btn">
          <BsQuestionCircle />
          <span>Help Center</span>
          </button>
          
          <button
          className="sidebar-footer-btn logout-btn"
          onClick={handleLogout}
          >
            
            <BsBoxArrowRight />
            <span>Logout</span>
            </button>
            </div>

    </aside>
  );
};

export default AppSidebar;