import React from "react";
import { Container } from "react-bootstrap";

const Footer = () => {
  return (
    <footer>
      <Container className="py-3">
        <div className="text-center">
          <p className="mb-0">
            &copy; {new Date().getFullYear()} LostNFound. All rights reserved.
          </p>
        </div>
      </Container>
    </footer>
  );
};

export default Footer;

