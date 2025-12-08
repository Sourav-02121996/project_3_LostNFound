import React from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { Card } from "react-bootstrap";
import "../styles/components/Item.css";
import { API_BASE_URL } from "../config/api";

const Item = ({ item }) => {
  const imageUrl = item.image
    ? item.image.startsWith("http")
      ? item.image
      : `${API_BASE_URL}${item.image}`
    : null;

  return (
    <Card className="mb-4 item-card h-100">
      <Link to={`/item/${item._id}`} className="item-image-link">
        {imageUrl ? (
          <Card.Img
            variant="top"
            src={imageUrl}
            className="item-image"
            alt={item.name}
          />
        ) : (
          <div className="item-image-placeholder">
            <p>No Image</p>
          </div>
        )}
      </Link>
      <Card.Body className="d-flex flex-column">
        <Card.Title className="item-title">
          <Link to={`/item/${item._id}`} className="item-link">
            <strong>{item.name}</strong>
          </Link>
        </Card.Title>
        <Card.Text className="item-location">
          <span className="item-location-text">{item.location}</span>
        </Card.Text>
      </Card.Body>
    </Card>
  );
};

Item.propTypes = {
  item: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    image: PropTypes.string,
    name: PropTypes.string.isRequired,
    location: PropTypes.string.isRequired,
  }).isRequired,
};

export default Item;
