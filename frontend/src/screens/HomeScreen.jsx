import React from "react";
import { Container, Row, Col } from "react-bootstrap";
import Item from "../components/Item";
import items from "../items";

const HomeScreen = () => {
  return (
    <div className="home-screen">
      <Container>
        <h1 className="home-title">Lost Items</h1>
        <Row>
          {items.map((item) => (
            <Col key={item._id} sm={12} md={6} lg={4} xl={3}>
              <Item item={item} />
            </Col>
          ))}
        </Row>
      </Container>
    </div>
  );
};

export default HomeScreen;

