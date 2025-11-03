import React from "react";
import { Card } from "react-bootstrap";

const Item = ({ item }) => {
  return (
    <Card className="mb-4 item-card h-100">
      <a href={`/${item._id}`} className="item-image-link">
        <Card.Img variant="top" src={item.image} className="item-image" />
      </a>
      <Card.Body className="d-flex flex-column">
        <Card.Title className="item-title">
          <a href={`/${item._id}`} className="item-link">
            <strong>{item.name}</strong>
          </a>
        </Card.Title>
        <Card.Text className="item-location">
          <h3>{item.location}</h3>
        </Card.Text>
      </Card.Body>
    </Card>
  );
};

export default Item;

