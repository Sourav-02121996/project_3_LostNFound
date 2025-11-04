import React from "react";
import { Form } from "react-bootstrap";
import { FaSearch } from "react-icons/fa";
import "../styles/components/Searchbar.css";

const Searchbar = ({ searchTerm, onSearchChange }) => {
  return (
    <div className="searchbar-container">
      <Form.Group className="searchbar-group">
        <FaSearch className="search-icon" />
        <Form.Control
          type="text"
          placeholder="Search items by name, location, or category..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="searchbar-input"
        />
      </Form.Group>
    </div>
  );
};

export default Searchbar;

