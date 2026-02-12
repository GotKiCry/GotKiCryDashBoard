import React from 'react';
import { FiSettings, FiUser } from 'react-icons/fi';
import './TopBar.css';

const TopBar = () => {
    return (
        <div className="top-bar">
            <div className="brand-section">
                <span className="brand-name">GotKiCry'Dashboard</span>
            </div>

            <div className="top-actions">
                <button className="icon-btn" title="设置">
                    <FiSettings />
                </button>
                <button className="icon-btn" title="个人资料">
                    <FiUser />
                </button>
            </div>
        </div>
    );
};

export default TopBar;
