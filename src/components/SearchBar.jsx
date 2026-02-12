import React, { useState } from 'react';
import { FiSearch } from 'react-icons/fi';
import './SearchBar.css';

const SearchBar = () => {
    const [query, setQuery] = useState('');
    const [isFocused, setIsFocused] = useState(false);

    const handleSearch = (e) => {
        e.preventDefault();
        if (!query.trim()) return;
        // Default to Bing for Mainland China compliance (Google is blocked)
        window.location.href = `https://www.bing.com/search?q=${encodeURIComponent(query)}`;
    };

    return (
        <form
            className={`search-bar-container ${isFocused ? 'focused' : ''}`}
            onSubmit={handleSearch}
        >
            <FiSearch className="search-icon" />
            <input
                type="text"
                className="search-input"
                placeholder=""
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                autoFocus
            />
            {/* Future: Add engine selector here */}
        </form>
    );
};

export default SearchBar;
