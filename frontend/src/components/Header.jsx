//Several icon-only buttons and placeholders lack `aria-label`. This makes them invisible to screen readers. Adding accessibility labels improves usability.


import React from "react";
import { Navbar, Nav, Container } from "react-bootstrap";
import { FaUser, FaBell } from "react-icons/fa";
import Logo from "./Logo";
import "../styles/components/Header.css";

const Header = () => {
  return (
    <header>
      <Navbar bg="dark" variant="dark" expand="md" collapseOnSelect>
        <Container>
          <Navbar.Brand href="/">
            <Logo />
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="ms-auto">
              <Nav.Link href="/items">Lost Items</Nav.Link>
              <Nav.Link href="/post">Post an Item</Nav.Link>
              <Nav.Link href="/notifications">
                <FaBell />
              </Nav.Link>
              <Nav.Link href="/profile">
                <FaUser /> Profile
              </Nav.Link>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    </header>
  );
};

export default Header;
