import React, { useState } from 'react';
import { useAppStore } from '../store';
import { FiSearch, FiNavigation } from 'react-icons/fi';
import Modal from './Modal';
import './WeatherSettings.css';

const WeatherSettings = ({ isOpen, onClose, detectedLocation, onRefresh, refreshing }) => {
    const globalWeatherConfig = useAppStore(state => state.settings.weather) || { mode: 'auto' };
    const updateWeather = useAppStore(state => state.updateWeatherConfig);

    // Local state for pending changes
    const [pendingConfig, setPendingConfig] = useState(globalWeatherConfig);

    const [searchQuery, setSearchQuery] = useState('');
    const [results, setResults] = useState([]);
    const [searching, setSearching] = useState(false);

    // Sync local state when modal opens
    React.useEffect(() => {
        if (isOpen) {
            setPendingConfig(globalWeatherConfig);
            setSearchQuery('');
            setResults([]);
        }
    }, [isOpen, globalWeatherConfig]);

    if (!isOpen) return null;

    const handleSearch = async () => {
        if (!searchQuery.trim()) return;
        setSearching(true);
        try {
            // Using Open-Meteo Geocoding API with Chinese language support
            const res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(searchQuery)}&count=10&language=zh&format=json`);
            const data = await res.json();
            setResults(data.results || []);
        } catch (err) {
            console.error(err);
        } finally {
            setSearching(false);
        }
    };

    const selectCity = (city) => {
        // Just update pending state, don't close
        setPendingConfig({
            mode: 'manual',
            city: city.name,
            lat: city.latitude,
            lon: city.longitude
        });
        setResults([]);
    };

    const setAuto = () => {
        // Just update pending state, don't close
        setPendingConfig({
            mode: 'auto',
            city: detectedLocation?.city || 'Detecting...'
        });
    };

    const handleSave = () => {
        updateWeather(pendingConfig);
        onClose();
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="天气设置"
            footer={
                <>
                    <button className="btn btn-secondary" onClick={onClose}>取消</button>
                    <button className="btn btn-primary" onClick={handleSave}>保存</button>
                </>
            }
        >
            <div className="mode-selector">
                <button
                    className={`mode-btn ${pendingConfig.mode === 'auto' ? 'active' : ''}`}
                    onClick={setAuto}
                >
                    <FiNavigation style={{ marginRight: '8px' }} />
                    Auto (自动)
                </button>
                <button
                    className={`mode-btn ${pendingConfig.mode === 'manual' ? 'active' : ''}`}
                    onClick={() => setPendingConfig({ ...pendingConfig, mode: 'manual' })}
                >
                    <FiSearch style={{ marginRight: '8px' }} />
                    手动
                </button>
            </div>

            {pendingConfig.mode === 'auto' && (
                <div style={{ marginTop: '15px', padding: '10px', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '8px', fontSize: '0.9rem' }}>
                    <div style={{ marginBottom: '5px', color: '#4cc9f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span>当前检测位置:</span>
                        {onRefresh && (
                            <button
                                onClick={onRefresh}
                                disabled={refreshing}
                                style={{
                                    background: 'transparent',
                                    border: '1px solid rgba(255,255,255,0.2)',
                                    color: 'white',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    fontSize: '0.8rem',
                                    padding: '2px 8px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '4px',
                                    opacity: refreshing ? 0.6 : 1
                                }}
                            >
                                <FiNavigation className={refreshing ? 'spin-icon' : ''} size={12} />
                                {refreshing ? '刷新中...' : '刷新'}
                            </button>
                        )}
                    </div>
                    {detectedLocation ? (
                        <>
                            <div><strong>IP:</strong> {detectedLocation.ip}</div>
                            <div><strong>城市:</strong> {detectedLocation.city}</div>
                        </>
                    ) : (
                        <div style={{ fontStyle: 'italic', opacity: 0.7 }}>正在获取位置信息...</div>
                    )}
                </div>
            )}

            {pendingConfig.mode === 'manual' && (
                <div className="search-section">
                    {/* Show currently selected or pending city if exists */}
                    {(pendingConfig.city && pendingConfig.city !== 'Detecting...') && (
                        <div style={{ marginBottom: '10px', color: '#4cc9f0', fontSize: '0.9rem' }}>
                            当前选择: <strong>{pendingConfig.city}</strong>
                        </div>
                    )}

                    <div style={{ position: 'relative' }}>
                        <input
                            className="city-search-input"
                            placeholder="搜索城市 (例如: 北京, Shanghai)"
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleSearch()}
                            style={{ width: '100%', boxSizing: 'border-box' }}
                        />
                    </div>
                    <button className="btn btn-primary" onClick={handleSearch} disabled={searching} style={{ width: '100%', marginTop: '5px' }}>
                        {searching ? '搜索中...' : '搜索'}
                    </button>

                    {results.length > 0 && (
                        <div className="search-results">
                            {results.map(city => (
                                <div key={city.id} className="result-item" onClick={() => selectCity(city)}>
                                    <span className="result-name">{city.name}</span>
                                    <span className="result-admin">
                                        {city.admin1 ? `${city.admin1}, ` : ''}
                                        {city.country}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </Modal>
    );
};

export default WeatherSettings;
