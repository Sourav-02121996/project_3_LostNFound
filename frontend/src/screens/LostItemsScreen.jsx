import React, { useState, useEffect, useMemo } from "react";
import PropTypes from "prop-types";
import {
  Container,
  Row,
  Col,
  Form,
  Button,
  Card,
  Spinner,
} from "react-bootstrap";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import Item from "../components/Item";
import Searchbar from "../components/Searchbar";
import "../styles/screens/LostItemsScreen.css";
import { API_BASE_URL } from "../config/api";

const LostItemsScreen = ({ apiBaseUrl = API_BASE_URL, fetchFn = fetch }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    location: "",
    dateFound: "",
    category: "",
  });
  const [allLocations, setAllLocations] = useState([]);
  const [allCategories, setAllCategories] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    totalPages: 1,
    totalCount: 0,
    hasNextPage: false,
    hasPrevPage: false,
  });

  useEffect(() => {
    const fetchItems = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams();
        if (searchTerm) params.append("search", searchTerm);
        if (filters.location) params.append("location", filters.location);
        if (filters.dateFound) params.append("dateFound", filters.dateFound);
        if (filters.category) params.append("category", filters.category);
        params.append("status", "searching");
        params.append("page", currentPage.toString());
        params.append("limit", "12");

        const response = await fetchFn(
          `${apiBaseUrl}/api/items?${params.toString()}`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch items");
        }
        const data = await response.json();
        if (Array.isArray(data)) {
          const activeItems = data.filter((item) => item.status !== "claimed");
          setItems(activeItems);
        } else {
          setItems(data.items || []);
          if (data.pagination) {
            setPagination(data.pagination);
          }
        }
        setError(null);
      } catch (err) {
        setError(err.message);
        console.error("Error fetching items:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, [
    apiBaseUrl,
    fetchFn,
    searchTerm,
    filters.location,
    filters.dateFound,
    filters.category,
    currentPage,
  ]);

  // Fetch full list of locations and categories once so dropdowns
  // always show every option even when filtered results are limited.
  useEffect(() => {
    const fetchAllOptions = async () => {
      try {
        const params = new URLSearchParams();
        params.append("status", "searching");
        params.append("limit", "1000");

        const response = await fetchFn(
          `${apiBaseUrl}/api/items?${params.toString()}`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch options");
        }
        const data = await response.json();
        let itemsData = [];
        if (Array.isArray(data)) {
          itemsData = data;
        } else {
          itemsData = data.items || [];
        }

        const uniqueLocations = [
          ...new Set(itemsData.map((item) => item.location).filter(Boolean)),
        ].sort();
        const uniqueCategories = [
          ...new Set(itemsData.map((item) => item.category).filter(Boolean)),
        ].sort();

        setAllLocations(uniqueLocations);
        setAllCategories(uniqueCategories);
      } catch (err) {
        console.error("Error fetching filter options:", err);
      }
    };

    fetchAllOptions();
  }, [apiBaseUrl, fetchFn]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filters.location, filters.dateFound, filters.category]);

  const locations = useMemo(() => {
    if (allLocations && allLocations.length > 0) return allLocations;
    const uniqueLocations = [...new Set(items.map((item) => item.location))];
    return uniqueLocations.sort();
  }, [allLocations, items]);

  const categories = useMemo(() => {
    if (allCategories && allCategories.length > 0) return allCategories;
    const uniqueCategories = [...new Set(items.map((item) => item.category))];
    return uniqueCategories.sort();
  }, [allCategories, items]);

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
            Browse through all lost items and use filters to find what you're looking for
          </p>
        </div>

        <Searchbar searchTerm={searchTerm} onSearchChange={setSearchTerm} />

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
          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" role="status">
                <span className="visually-hidden">Loading...</span>
              </Spinner>
            </div>
          ) : error ? (
            <div className="no-items-message">
              <p>Error loading items: {error}</p>
            </div>
          ) : (
            <>
              <div className="results-header">
                <h3 className="results-title">
                  {items.length === 0
                    ? "No items found"
                    : `${pagination.totalCount || items.length} item${
                        (pagination.totalCount || items.length) !== 1 ? "s" : ""
                      } found`}
                </h3>
              </div>

              {items.length > 0 ? (
                <>
                  <Row className="items-row">
                    {items.map((item) => (
                      <Col key={item._id} sm={12} md={6} lg={4} xl={3}>
                        <Item item={item} />
                      </Col>
                    ))}
                  </Row>

                  {pagination.totalPages > 1 && (
                    <div className="pagination-container mt-4">
                      <div className="pagination-info mb-3 text-center">
                        <p className="text-muted mb-0">
                          Showing page {pagination.currentPage} of {pagination.totalPages}
                        </p>
                      </div>
                      <div className="pagination-controls d-flex justify-content-center align-items-center gap-2">
                        <Button
                          variant="outline-primary"
                          size="sm"
                          onClick={() =>
                            setCurrentPage((prev) => Math.max(1, prev - 1))
                          }
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
                </>
              ) : (
                <div className="no-items-message">
                  <p>
                    No items match your current filters. Try adjusting your search criteria.
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </Container>
    </div>
  );
};

LostItemsScreen.propTypes = {
  apiBaseUrl: PropTypes.string,
  fetchFn: PropTypes.func,
};

export default LostItemsScreen;
