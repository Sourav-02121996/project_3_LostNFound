// 1. Several icon-only buttons and placeholders lack `aria-label`. This makes them invisible to screen readers. Adding accessibility labels improves usability.
// 2. If the token expires, these actions fail silently. Consider redirecting the user to login on a 401 response.


import React, { useState, useEffect, useMemo } from "react";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Card,
  Badge,
  Button,
  Row,
  Col,
  Spinner,
} from "react-bootstrap";
import {
  FaMapMarkerAlt,
  FaTag,
  FaCalendarAlt,
  FaEye,
  FaTimes,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";
import { Link } from "react-router-dom";
import "../styles/screens/NotificationScreen.css";
import { API_BASE_URL } from "../config/api";

const noopStorage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
};

const NotificationScreen = ({
  apiBaseUrl = API_BASE_URL,
  fetchFn = fetch,
  storage,
}) => {
  const navigate = useNavigate();
  const storageRef = useMemo(() => {
    if (storage) return storage;
    if (typeof window !== "undefined" && window.localStorage) {
      return window.localStorage;
    }
    return noopStorage;
  }, [storage]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userId, setUserId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    totalPages: 1,
    totalCount: 0,
    hasNextPage: false,
    hasPrevPage: false,
  });

  useEffect(() => {
    const token = storageRef.getItem("token");
    const userData = storageRef.getItem("user");

    if (!token) {
      navigate("/login");
      return;
    }

    if (userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUserId(parsedUser._id);
      } catch (err) {
        console.error("Error parsing user data:", err);
      }
    }
  }, [navigate, storageRef]);

  useEffect(() => {
    const fetchNotifications = async () => {
      if (!userId) return;

      try {
        setLoading(true);
        const response = await fetchFn(
          `${apiBaseUrl}/api/notifications?userId=${userId}&page=${currentPage}&limit=10`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch notifications");
        }
        const data = await response.json();
        setNotifications(data.notifications || data);
        if (data.pagination) {
          setPagination(data.pagination);
        }
        setError(null);
      } catch (err) {
        setError(err.message);
        console.error("Error fetching notifications:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, [apiBaseUrl, fetchFn, userId, currentPage]);

  const markAsRead = async (notificationId) => {
    try {
      const response = await fetchFn(
        `${apiBaseUrl}/api/notifications/${notificationId}/read`,
        {
          method: "PUT",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to mark notification as read");
      }

      setNotifications(
        notifications.map((notif) =>
          notif._id === notificationId ? { ...notif, read: true } : notif
        )
      );
    } catch (err) {
      console.error("Error marking notification as read:", err);
      alert("Failed to mark notification as read");
    }
  };

  const markAllAsRead = async () => {
    if (!userId) return;

    try {
      const response = await fetchFn(
        `${apiBaseUrl}/api/notifications/read-all`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ userId }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to mark all notifications as read");
      }

      setNotifications(
        notifications.map((notif) => ({ ...notif, read: true }))
      );
    } catch (err) {
      console.error("Error marking all notifications as read:", err);
      alert("Failed to mark all notifications as read");
    }
  };

  const deleteNotification = async (notificationId) => {
    if (!window.confirm("Are you sure you want to delete this notification?")) {
      return;
    }

    try {
      const response = await fetchFn(
        `${apiBaseUrl}/api/notifications/${notificationId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete notification");
      }

      setNotifications(
        notifications.filter((notif) => notif._id !== notificationId)
      );
    } catch (err) {
      console.error("Error deleting notification:", err);
      alert("Failed to delete notification");
    }
  };

  const unreadCount = notifications.filter((notif) => !notif.read).length;

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) return "Just now";
    if (diffInSeconds < 3600)
      return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400)
      return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 604800)
      return `${Math.floor(diffInSeconds / 86400)} days ago`;
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith("http")) return imagePath;
    return `${apiBaseUrl}${imagePath}`;
  };

  if (loading) {
    return (
      <div className="notification-screen">
        <Container>
          <div className="text-center py-5">
            <Spinner animation="border" role="status">
              <span className="visually-hidden">Loading notifications...</span>
            </Spinner>
          </div>
        </Container>
      </div>
    );
  }

  if (error) {
    return (
      <div className="notification-screen">
        <Container>
          <Card className="empty-notifications-card">
            <Card.Body className="text-center p-5">
              <h3>Error Loading Notifications</h3>
              <p className="text-muted">{error}</p>
            </Card.Body>
          </Card>
        </Container>
      </div>
    );
  }

  return (
    <div className="notification-screen">
      <Container>
        <div className="notification-header">
          <div className="header-content">
            <h1 className="notification-title">Notifications</h1>
            <p className="notification-subtitle">
              Stay updated with the latest lost items posted
            </p>
          </div>
          {unreadCount > 0 && (
            <div className="header-actions">
              <Button
                variant="outline-primary"
                size="sm"
                onClick={markAllAsRead}
                className="mark-all-read-btn"
              >
                Mark all as read
              </Button>
              <Badge bg="primary" className="unread-badge">
                {unreadCount} new
              </Badge>
            </div>
          )}
        </div>

        {notifications.length === 0 ? (
          <Card className="empty-notifications-card">
            <Card.Body className="text-center p-5">
              <h3>No Notifications</h3>
              <p className="text-muted">
                You're all caught up! No new notifications at the moment.
              </p>
            </Card.Body>
          </Card>
        ) : (
          <div className="notifications-list">
            {notifications.map((notification) => {
              const itemName = notification.itemName || "Unknown Item";
              const itemLocation =
                notification.itemLocation || "Unknown Location";
              const itemImage = notification.itemImage || null;
              const itemCategory = notification.itemCategory || "Other";
              const dateFound =
                notification.dateFound || notification.createdAt;
              const imageUrl = getImageUrl(itemImage);

              return (
                <Card
                  key={notification._id}
                  className={`notification-card ${!notification.read ? "unread" : ""}`}
                >
                  <Row className="g-0">
                    <Col xs={3} md={2} className="notification-image-col">
                      <div className="notification-image-wrapper">
                        {imageUrl ? (
                          <img
                            src={imageUrl}
                            alt={itemName}
                            className="notification-image"
                          />
                        ) : (
                          <div className="notification-image-placeholder">
                            <p>No Image</p>
                          </div>
                        )}
                        {!notification.read && (
                          <div className="unread-indicator"></div>
                        )}
                      </div>
                    </Col>
                    <Col xs={9} md={10}>
                      <Card.Body className="p-3">
                        <div className="notification-content">
                          <div className="notification-main">
                            <h4 className="notification-item-name">
                              {notification.type === "claimed"
                                ? `Item Claimed: ${itemName}`
                                : `New Item: ${itemName}`}
                            </h4>
                            <div className="notification-details">
                              <span className="notification-detail-item">
                                <FaMapMarkerAlt className="detail-icon" />
                                {itemLocation}
                              </span>
                              <span className="notification-detail-item">
                                <FaTag className="detail-icon" />
                                {itemCategory}
                              </span>
                              <span className="notification-detail-item">
                                <FaCalendarAlt className="detail-icon" />
                                Found on {" "}
                                {new Date(dateFound).toLocaleDateString(
                                  "en-US",
                                  {
                                    month: "short",
                                    day: "numeric",
                                  }
                                )}
                              </span>
                            </div>
                            <p className="notification-time">
                              {formatTimeAgo(notification.createdAt)}
                            </p>
                          </div>
                          <div className="notification-actions">
                            <Link
                              to={`/item/${notification.itemId}`}
                              className="view-item-btn"
                              onClick={() => markAsRead(notification._id)}
                            >
                              <FaEye /> View Item
                            </Link>
                            <Button
                              variant="outline-danger"
                              size="sm"
                              className="delete-notification-btn"
                              onClick={() =>
                                deleteNotification(notification._id)
                              }
                            >
                              <FaTimes />
                            </Button>
                          </div>
                        </div>
                      </Card.Body>
                    </Col>
                  </Row>
                </Card>
              );
            })}
          </div>
        )}

        {pagination.totalPages > 1 && (
          <div className="pagination-container mt-4">
            <div className="pagination-info mb-3">
              <p className="text-muted mb-0">
                Showing page {pagination.currentPage} of {pagination.totalPages}
                ({pagination.totalCount} total notifications)
              </p>
            </div>
            <div className="pagination-controls d-flex justify-content-center align-items-center gap-2">
              <Button
                variant="outline-primary"
                size="sm"
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={!pagination.hasPrevPage || loading}
              >
                <FaChevronLeft /> Previous
              </Button>

              <div className="page-numbers d-flex gap-1">
                {Array.from(
                  { length: Math.min(5, pagination.totalPages) },
                  (_, i) => {
                    let pageNum;
                    if (pagination.totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (pagination.currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (
                      pagination.currentPage >=
                      pagination.totalPages - 2
                    ) {
                      pageNum = pagination.totalPages - 4 + i;
                    } else {
                      pageNum = pagination.currentPage - 2 + i;
                    }

                    return (
                      <Button
                        key={pageNum}
                        variant={
                          pagination.currentPage === pageNum
                            ? "primary"
                            : "outline-primary"
                        }
                        size="sm"
                        onClick={() => setCurrentPage(pageNum)}
                        disabled={loading}
                      >
                        {pageNum}
                      </Button>
                    );
                  }
                )}
              </div>

              <Button
                variant="outline-primary"
                size="sm"
                onClick={() =>
                  setCurrentPage((prev) =>
                    Math.min(pagination.totalPages, prev + 1)
                  )
                }
                disabled={!pagination.hasNextPage || loading}
              >
                Next <FaChevronRight />
              </Button>
            </div>
          </div>
        )}
      </Container>
    </div>
  );
};

NotificationScreen.propTypes = {
  apiBaseUrl: PropTypes.string,
  fetchFn: PropTypes.func,
  storage: PropTypes.shape({
    getItem: PropTypes.func.isRequired,
    setItem: PropTypes.func.isRequired,
    removeItem: PropTypes.func.isRequired,
  }),
};

export default NotificationScreen;
