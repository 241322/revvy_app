import React, { useState } from "react";
import styles from "../styles/SearchBar.module.css";

const SearchBar = () => {
  const [query, setQuery] = useState("");

  const handleSearch = () => {
    console.log("Searching for:", query);
  };

  return (
    <div className={styles.searchBar}>
      <input
        type="text"
        placeholder="Search by Make, Model, Trim, or VIN..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className={styles.input}
      />
      <button onClick={handleSearch} className={styles.button}>Search</button>
    </div>
  );
};

export default SearchBar;