import React, { useState, useMemo } from "react";
import { Container, Row, Col, Form, Button, Card } from "react-bootstrap";
import Item from "../components/Item";
import items from "../items";
import "../styles/screens/LostItemsScreen.css";

const LostItemsScreen = () => {
  const [filters, setFilters] = useState({
    location: "",
    dateFound: "",
    category: "",
  });

  // Get unique values for filter options
  const locations = useMemo(() => {
    const uniqueLocations = [...new Set(items.map((item) => item.location))];
    return uniqueLocations.sort();
  }, []);

  const categories = useMemo(() => {
    const uniqueCategories = [
      ...new Set(items.map((item) => item.category)),
    ];
    return uniqueCategories.sort();
  }, []);

  // Filter items based on selected filters
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesLocation =
        !filters.location || item.location === filters.location;
      const matchesDate =
        !filters.dateFound || item.dateFound === filters.dateFound;
      const matchesCategory =
        !filters.category || item.category === filters.category;

      return matchesLocation && matchesDate && matchesCategory;
    });
  }, [filters]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({
      ...filters,
      [name]: value,
    });
  };

  const handleClearFilters = () => {
    setFilters({
      location: "",
      dateFound: "",
      category: "",
    });
  };

  const hasActiveFilters =
    filters.location || filters.dateFound || filters.category;

  return (
    <div className="lost-items-screen">
      <Container>
        <div className="screen-header">
          <h1 className="screen-title">Lost Items</h1>
          <p className="screen-subtitle">
            Browse through all lost items and use filters to find what you're
            looking for
          </p>
        </div>

        <Card className="filter-card">
          <Card.Body className="p-4">
            <div className="filter-header">
              <h3 className="filter-title">Filter Items</h3>
              {hasActiveFilters && (
                <Button
                  variant="outline-secondary"
                  size="sm"
                  onClick={handleClearFilters}
                  className="clear-filters-btn"
                >
                  Clear Filters
                </Button>
              )}
            </div>

            <Row className="mt-3">
              <Col md={4} className="mb-3">
                <Form.Group controlId="filterLocation">
                  <Form.Label>Location</Form.Label>
                  <Form.Select
                    name="location"
                    value={filters.location}
                    onChange={handleFilterChange}
                    className="filter-select"
                  >
                    <option value="">All Locations</option>
                    {locations.map((location) => (
                      <option key={location} value={location}>
                        {location}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>

              <Col md={4} className="mb-3">
                <Form.Group controlId="filterDate">
                  <Form.Label>Date Found</Form.Label>
                  <Form.Control
                    type="date"
                    name="dateFound"
                    value={filters.dateFound}
                    onChange={handleFilterChange}
                    className="filter-input"
                  />
                </Form.Group>
              </Col>

              <Col md={4} className="mb-3">
                <Form.Group controlId="filterCategory">
                  <Form.Label>Category</Form.Label>
                  <Form.Select
                    name="category"
                    value={filters.category}
                    onChange={handleFilterChange}
                    className="filter-select"
                  >
                    <option value="">All Categories</option>
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        <div className="results-section">
          <div className="results-header">
            <h3 className="results-title">
              {filteredItems.length === 0
                ? "No items found"
                : `${filteredItems.length} item${filteredItems.length !== 1 ? "s" : ""} found`}
            </h3>
          </div>

          {filteredItems.length > 0 ? (
            <Row className="items-row">
              {filteredItems.map((item) => (
                <Col key={item._id} sm={12} md={6} lg={4} xl={3}>
                  <Item item={item} />
                </Col>
              ))}
            </Row>
          ) : (
            <div className="no-items-message">
              <p>No items match your current filters. Try adjusting your search criteria.</p>
            </div>
          )}
        </div>
      </Container>
    </div>
  );
};

export default LostItemsScreen;

