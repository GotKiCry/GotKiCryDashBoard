import React, { useState, useRef, useEffect } from 'react';
import { FiSearch, FiChevronDown } from 'react-icons/fi';
import './SearchBar.css';

const ENGINES = [
    { key: 'google', label: 'Google', url: 'https://www.google.com/search?q=' },
    { key: 'bing', label: 'Bing', url: 'https://www.bing.com/search?q=' },
    { key: 'baidu', label: '百度', url: 'https://www.baidu.com/s?wd=' },
];

const SearchBar = () => {
    const [query, setQuery] = useState('');
    const [isFocused, setIsFocused] = useState(false);
    const [engine, setEngine] = useState(() => {
        const saved = localStorage.getItem('searchEngine');
        return ENGINES.find(e => e.key === saved) || ENGINES[0];
    });
    const [showEngines, setShowEngines] = useState(false);
    const inputRef = useRef(null);
    const dropdownRef = useRef(null);

    const handleContainerClick = (e) => {
        // 不要在点击引擎选择器区域时聚焦输入框
        if (dropdownRef.current?.contains(e.target)) return;
        inputRef.current?.focus();
    };

    const handleSearch = (e) => {
        e.preventDefault();
        if (!query.trim()) return;
        window.location.href = `${engine.url}${encodeURIComponent(query)}`;
    };

    const handleEngineSelect = (eng) => {
        setEngine(eng);
        localStorage.setItem('searchEngine', eng.key);
        setShowEngines(false);
        inputRef.current?.focus();
    };

    // 点击外部关闭下拉
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setShowEngines(false);
            }
        };
        if (showEngines) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [showEngines]);

    return (
        <form
            className={`search-bar-container ${isFocused ? 'focused' : ''}`}
            onSubmit={handleSearch}
            onClick={handleContainerClick}
        >
            <FiSearch className="search-icon" />
            <input
                ref={inputRef}
                type="text"
                className="search-input"
                placeholder=""
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                autoFocus
            />
            <div className="engine-selector" ref={dropdownRef}>
                <div className="engine-divider" />
                <button
                    type="button"
                    className="engine-current"
                    onClick={() => setShowEngines(!showEngines)}
                >
                    <span>{engine.label}</span>
                    <FiChevronDown className={`engine-arrow ${showEngines ? 'open' : ''}`} />
                </button>
                {showEngines && (
                    <div className="engine-dropdown">
                        {ENGINES.map((eng) => (
                            <button
                                key={eng.key}
                                type="button"
                                className={`engine-option ${eng.key === engine.key ? 'active' : ''}`}
                                onClick={() => handleEngineSelect(eng)}
                            >
                                {eng.label}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </form>
    );
};

export default SearchBar;
