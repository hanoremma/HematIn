import { useState, useEffect } from 'react'
import { Container, Nav, Navbar } from 'react-bootstrap'

import {navLinks} from '../data/index'
import { NavLink } from 'react-router-dom'
import ThemeToggle
from "./application/ThemeToggleButton";


const NavbarComponent = () => {
    const [changeColor, setChangeColor] = useState(false);

    const changeBackgroundColor = () => {
        if(window.scrollY > 10){
            setChangeColor(true);
        } else {
            setChangeColor(false);
        }
    };
const [expanded, setExpanded] =
  useState(false);

    useEffect(() => {
        window.addEventListener("scroll", changeBackgroundColor);

        return () => {
            window.removeEventListener("scroll", changeBackgroundColor);
        };
    }, []);

  return (
    <div><Navbar expand="lg" expanded={expanded} className={changeColor ? "color-active" : ""}>
      <Container>
        <Navbar.Brand as={NavLink} to="/" className="fs-3 fw-bold">Hematin</Navbar.Brand>
        <div className="landing-navbar-mobile-actions">
          <ThemeToggle />
          <Navbar.Toggle aria-controls="basic-navbar-nav" onClick={() => setExpanded(!expanded)} />
        </div>
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="mx-auto text-center">
            {navLinks.map((navLink) => {
                return(
                    <div className="nav-link" key={navLink.id}>
                        <NavLink to={navLink.path} onClick={() => setExpanded(false)} className={({ isActive, isPending }) =>
                        (isPending ? "pending" : isActive ? "active" : "")} end>
                            {navLink.text}
                        </NavLink>
                    </div>
                );
            })}
          </Nav>

          <div className="landing-navbar-actions">
            <ThemeToggle />
            <NavLink
            to="/register"
            className="btn btn-outline-danger rounded-1"
            onClick={() => setExpanded(false)}
            >
              Join With Us
              </NavLink>
              </div>
        </Navbar.Collapse>
      </Container>
    </Navbar></div>
  )
}

export default NavbarComponent

