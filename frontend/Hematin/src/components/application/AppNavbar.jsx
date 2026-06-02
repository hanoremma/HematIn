import { useState } from "react";
import { Offcanvas } from "react-bootstrap";

import AppSidebar from "./AppSidebar";
import ProfileMenu from "./ProfileMenu";
import ThemeToggle from "./ThemeToggleButton";

const AppNavbar = () => {

  const [show, setShow] = useState(false);

  return (
    <>
      <header className="app-navbar">

        {/* LEFT */}
        <div className="navbar-left">

          <button
            className="menu-btn"
            onClick={() => setShow(true)}
          >
            <i className="bi bi-grid"></i>
          </button>

        </div>

        {/* RIGHT */}
        <div className="navbar-right">

          <ThemeToggle />

          <ProfileMenu />

        </div>

      </header>

      {/* MOBILE SIDEBAR */}
      <Offcanvas
        show={show}
        onHide={() => setShow(false)}
        style={{ width: "300px" }}
      >

        <Offcanvas.Header closeButton>

          <Offcanvas.Title>
            Menu
          </Offcanvas.Title>

        </Offcanvas.Header>

        <Offcanvas.Body>

          <AppSidebar />

        </Offcanvas.Body>

      </Offcanvas>
    </>
  );

};

export default AppNavbar;