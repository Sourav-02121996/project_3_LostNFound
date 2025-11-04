import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Container, Row, Col, Card, Button } from "react-bootstrap";
import { FaMapMarkerAlt, FaCalendarAlt, FaTag, FaEnvelope, FaPhone, FaUser } from "react-icons/fa";
import items from "../items";
import "../styles/screens/ItemScreen.css";

const ItemScreen = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const item = items.find((i) => i._id === id);

  // If item not found, show error or redirect
  if (!item) {
    return (
      <div className="item-screen">
        <Container>
          <div className="not-found">
            <h2>Item Not Found</h2>
            <p>The item you're looking for doesn't exist.</p>
            <Button onClick={() => navigate("/items")} variant="primary">
              Back to Lost Items
            </Button>
          </div>
        </Container>
      </div>
    );
  }

  // Sample contact details (in real app, this would come from the user who posted)
  const contactDetails = {
    name: "John Doe",
    email: "john.doe@northeastern.edu",
    phone: "+1 (617) 555-0123",
    nuid: "N00123456",
  };

  return (
    <div className="item-screen">
      <Container>
        <Button
          variant="outline-secondary"
          onClick={() => navigate("/items")}
          className="back-btn"
        >
          ← Back to Lost Items
        </Button>

        <Row className="item-details-row">
          <Col lg={7} className="mb-4 mb-lg-0">
            <Card className="item-image-card">
              <Card.Img
                variant="top"
                src={item.image}
                alt={item.name}
                className="item-detail-image"
              />
            </Card>
          </Col>

          <Col lg={5}>
            <Card className="item-info-card">
              <Card.Body className="p-4">
                <h1 className="item-detail-name">{item.name}</h1>
                
                <div className="item-meta">
                  <div className="meta-item">
                    <FaMapMarkerAlt className="meta-icon" />
                    <span className="meta-label">Location:</span>
                    <span className="meta-value">{item.location}</span>
                  </div>
                  
                  <div className="meta-item">
                    <FaCalendarAlt className="meta-icon" />
                    <span className="meta-label">Date Found:</span>
                    <span className="meta-value">
                      {new Date(item.dateFound).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                  
                  <div className="meta-item">
                    <FaTag className="meta-icon" />
                    <span className="meta-label">Category:</span>
                    <span className="meta-value">{item.category}</span>
                  </div>
                </div>

                <div className="item-description">
                  <h3 className="description-title">Description</h3>
                  <p className="description-text">{item.description}</p>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        <Row className="mt-4">
          <Col lg={12}>
            <Card className="contact-card">
              <Card.Body className="p-4">
                <h3 className="contact-title">
                  <FaUser className="contact-title-icon" />
                  Contact Information
                </h3>
                <p className="contact-subtitle">
                  Get in touch with the person who found this item
                </p>
                
                <Row className="mt-4">
                  <Col md={6} className="mb-3">
                    <div className="contact-item">
                      <FaUser className="contact-icon" />
                      <div className="contact-details">
                        <span className="contact-label">Name</span>
                        <span className="contact-value">{contactDetails.name}</span>
                      </div>
                    </div>
                  </Col>
                  
                  <Col md={6} className="mb-3">
                    <div className="contact-item">
                      <FaEnvelope className="contact-icon" />
                      <div className="contact-details">
                        <span className="contact-label">Email</span>
                        <a
                          href={`mailto:${contactDetails.email}`}
                          className="contact-value contact-link"
                        >
                          {contactDetails.email}
                        </a>
                      </div>
                    </div>
                  </Col>
                  
                  <Col md={6} className="mb-3">
                    <div className="contact-item">
                      <FaPhone className="contact-icon" />
                      <div className="contact-details">
                        <span className="contact-label">Phone</span>
                        <a
                          href={`tel:${contactDetails.phone}`}
                          className="contact-value contact-link"
                        >
                          {contactDetails.phone}
                        </a>
                      </div>
                    </div>
                  </Col>
                  
                  <Col md={6} className="mb-3">
                    <div className="contact-item">
                      <FaTag className="contact-icon" />
                      <div className="contact-details">
                        <span className="contact-label">NUID</span>
                        <span className="contact-value">{contactDetails.nuid}</span>
                      </div>
                    </div>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default ItemScreen;

