import React from "react";
import { Container, Row, Col } from "react-bootstrap";
import {
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaFacebook,
  FaTwitter,
  FaInstagram,
  FaLinkedin,
} from "react-icons/fa";
import Logo from "./Logo";
import "../styles/components/Footer.css";

const Footer = () => {
  return (
    <footer>
      <Container className="py-4">
        <Row>
          <Col md={4} className="mb-4 mb-md-0">
            <h2 className="footer-title">
              <Logo className="footer-logo" />
            </h2>
            <p className="footer-description">
              Helping you find lost items and reunite with your belongings.
            </p>
          </Col>

          <Col md={4} className="mb-4 mb-md-0">
            <h2 className="footer-title">Contact Us</h2>
            <div className="footer-contact">
              <div className="contact-item">
                <FaEnvelope className="contact-icon" />
                <a href="mailto:contact@lostnfound.com">
                  contact@lostnfound.com
                </a>
              </div>
              <div className="contact-item">
                <FaPhone className="contact-icon" />
                <a href="tel:+1234567890">+1 (234) 567-8900</a>
              </div>
              <div className="contact-item">
                <FaMapMarkerAlt className="contact-icon" />
                <span>123 Main Street, Boston, MA 02115</span>
              </div>
            </div>
          </Col>

          <Col md={4}>
            <h2 className="footer-title">Follow Us</h2>
            <div className="footer-social">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="social-link"
                aria-label="LostNFound on Facebook"
              >
                <FaFacebook aria-hidden="true" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="social-link"
                aria-label="LostNFound on Twitter"
              >
                <FaTwitter aria-hidden="true" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="social-link"
                aria-label="LostNFound on Instagram"
              >
                <FaInstagram aria-hidden="true" />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="social-link"
                aria-label="LostNFound on LinkedIn"
              >
                <FaLinkedin aria-hidden="true" />
              </a>
            </div>
          </Col>
        </Row>

        <hr className="footer-divider" />

        <Row>
          <Col className="text-center">
            <p className="footer-copyright mb-0">
              &copy; {new Date().getFullYear()} LostNFound. All rights reserved.
            </p>
          </Col>
        </Row>
      </Container>
    </footer>
  );
};

export default Footer;
