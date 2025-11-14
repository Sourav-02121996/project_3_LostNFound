//Several icon-only buttons and placeholders lack `aria-label`. This makes them invisible to screen readers. Adding accessibility labels improves usability.


import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { useParams, useNavigate } from "react-router-dom";
import { Container, Row, Col, Card, Button, Spinner } from "react-bootstrap";
import {
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaTag,
  FaEnvelope,
  FaPhone,
  FaUser,
} from "react-icons/fa";
import "../styles/screens/ItemScreen.css";
import { API_BASE_URL } from "../config/api";

const ItemScreen = ({ apiBaseUrl = API_BASE_URL, fetchFn = fetch }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingUser, setLoadingUser] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchItem = async () => {
      try {
        setLoading(true);
        const response = await fetchFn(`${apiBaseUrl}/api/items/${id}`);
        if (!response.ok) {
          if (response.status === 404) {
            setError("Item not found");
          } else {
            throw new Error("Failed to fetch item");
          }
          return;
        }
        const itemData = await response.json();
        setItem(itemData);

        if (itemData.userId) {
          try {
            setLoadingUser(true);
            const userResponse = await fetchFn(
              `${apiBaseUrl}/api/users/profile?userId=${itemData.userId}`
            );
            if (userResponse.ok) {
              const userData = await userResponse.json();
              setUser(userData);
            } else {
              console.error(
                "Failed to fetch user profile:",
                userResponse.status
              );
            }
          } catch (err) {
            console.error("Error fetching user:", err);
          } finally {
            setLoadingUser(false);
          }
        }
        setError(null);
      } catch (err) {
        setError(err.message);
        console.error("Error fetching item:", err);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchItem();
    }
  }, [apiBaseUrl, fetchFn, id]);

  if (loading) {
    return (
      <div className="item-screen">
        <Container>
          <div className="text-center py-5">
            <Spinner animation="border" role="status">
              <span className="visually-hidden">Loading...</span>
            </Spinner>
          </div>
        </Container>
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="item-screen">
        <Container>
          <div className="not-found">
            <h2>Item Not Found</h2>
            <p>{error || "The item you're looking for doesn't exist."}</p>
            <Button onClick={() => navigate("/items")} variant="primary">
              Back to Lost Items
            </Button>
          </div>
        </Container>
      </div>
    );
  }

  const contactDetails = user
    ? {
        name: user.name || "Unknown",
        email: user.email || "N/A",
        phone: user.phone || "N/A",
        nuid: user.nuid || "N/A",
      }
    : {
        name: "Unknown",
        email: "N/A",
        phone: "N/A",
        nuid: "N/A",
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
              {item.image ? (
                <Card.Img
                  variant="top"
                  src={
                    item.image.startsWith("http")
                      ? item.image
                      : `${apiBaseUrl}${item.image}`
                  }
                  alt={item.name}
                  className="item-detail-image"
                />
              ) : (
                <div className="item-detail-image-placeholder">
                  <p>No image available</p>
                </div>
              )}
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
                  Get in touch with the person who posted this item
                </p>

                {loadingUser ? (
                  <div className="text-center py-4">
                    <Spinner animation="border" size="sm" role="status">
                      <span className="visually-hidden">
                        Loading contact information...
                      </span>
                    </Spinner>
                  </div>
                ) : (
                  <Row className="mt-4">
                    <Col md={6} className="mb-3">
                      <div className="contact-item">
                        <FaUser className="contact-icon" />
                        <div className="contact-details">
                          <span className="contact-label">Name</span>
                          <span className="contact-value">
                            {contactDetails.name}
                          </span>
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
                          <span className="contact-value">
                            {contactDetails.nuid}
                          </span>
                        </div>
                      </div>
                    </Col>
                  </Row>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

ItemScreen.propTypes = {
  apiBaseUrl: PropTypes.string,
  fetchFn: PropTypes.func,
};

export default ItemScreen;
