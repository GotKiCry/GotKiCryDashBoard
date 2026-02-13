import React, { useState, useEffect } from 'react';
import { useAppStore } from '../store';
import {
    WiDaySunny, WiCloudy, WiRain, WiSnow, WiThunderstorm, WiFog, WiDayCloudy
} from 'react-icons/wi';
import { FiMapPin } from 'react-icons/fi';
import WeatherSettings from './WeatherSettings';
import './Weather.css';
import LiquidGlass from 'liquid-glass-react';

const Weather = () => {
    // Stale localStorage might not have the 'weather' object yet
    const config = useAppStore(state => state.settings.weather) || { mode: 'auto' };
    const updateWeatherConfig = useAppStore(state => state.updateWeatherConfig);

    const [weather, setWeather] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [detectedLocation, setDetectedLocation] = useState(null);

    const getWeatherIcon = (code) => {
        if (code === 0) return <WiDaySunny />;
        if (code >= 1 && code <= 3) return <WiDayCloudy />;
        if (code >= 45 && code <= 48) return <WiFog />;
        if (code >= 51 && code <= 67) return <WiRain />;
        if (code >= 71 && code <= 77) return <WiSnow />;
        if (code >= 80 && code <= 82) return <WiRain />;
        if (code >= 85 && code <= 86) return <WiSnow />;
        if (code >= 95) return <WiThunderstorm />;
        return <WiCloudy />;
    };

    const CACHE_KEY = 'weather_data_cache';
    const CACHE_DURATION = 6 * 60 * 60 * 1000; // 6 hours

    const saveToCache = (weatherData, locationData) => {
        localStorage.setItem(CACHE_KEY, JSON.stringify({
            timestamp: Date.now(),
            data: weatherData,
            location: locationData,
            savedConfig: config
        }));
    };

    const fetchWeather = async (lat, lon, cityName, locData = null) => {
        setLoading(true);
        try {
            // Fetch Current + Daily (for high/low)
            const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&daily=temperature_2m_max,temperature_2m_min&timezone=auto`;
            const res = await fetch(url);
            const data = await res.json();

            if (data.current_weather) {
                const weatherData = {
                    temp: Math.round(data.current_weather.temperature),
                    max: Math.round(data.daily.temperature_2m_max[0]),
                    min: Math.round(data.daily.temperature_2m_min[0]),
                    code: data.current_weather.weathercode,
                    city: cityName
                };
                setWeather(weatherData);
                // If we have location data (from auto-detect), cache it too
                saveToCache(weatherData, locData || detectedLocation);
            }
        } catch (err) {
            console.error(err);
            setError('获取天气失败');
        } finally {
            setLoading(false);
        }
    };

    // Helper to fetch IP and Location from multiple sources
    const fetchUserLocation = async () => {
        // ... (existing implementation)
        // 1. Try IPIP.net (China Optimized, Accurate)
        try {
            const res = await fetch('https://myip.ipip.net/json');
            if (res.ok) {
                const data = await res.json();
                // Format: {"data":{"location":["中国","广东","深圳","","电信"],"ip":"..."}}
                if (data.data && data.data.location && data.data.location.length > 2) {
                    return {
                        city: data.data.location[2], // e.g. "深圳"
                        ip: data.data.ip
                    };
                }
            }
        } catch (e) {
            console.warn("IPIP.net failed:", e);
        }

        // 2. Try IP.SB (Global, Fast, HTTPS)
        try {
            const res = await fetch('https://api.ip.sb/geoip');
            if (res.ok) {
                const data = await res.json();
                return {
                    city: data.city, // e.g. "Beijing"
                    ip: data.ip
                };
            }
        } catch (e) {
            console.warn("IP.SB failed:", e);
        }

        return null;
    };

    const resolveLocationFromIP = async () => {
        let cityName = null;
        let ip = null;

        // 1. Try Primary Source: Multi-provider fetch
        try {
            console.log("Attempting to fetch location...");
            const data = await fetchUserLocation();
            if (data) {
                console.log("Location fetch success:", data);
                cityName = data.city;
                ip = data.ip;
            }
        } catch (e) {
            console.warn("Location fetch failed", e);
        }

        // 2. Backup: ipapi.co (Legacy fallback)
        if (!cityName) {
            try {
                const res = await fetch('https://ipapi.co/json/');
                if (res.ok) {
                    const data = await res.json();
                    cityName = data.city;
                    ip = data.ip;
                }
            } catch (e) {
                console.error("Backup IP API (ipapi.co) failed", e);
            }
        }

        if (cityName) {
            try {
                // 3. Resolve City Name to Lat/Lon + Chinese Name using Open-Meteo
                // request language=zh to get Chinese output for the detected city name
                const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cityName)}&count=1&language=zh&format=json`);
                const geoData = await geoRes.json();

                if (geoData.results && geoData.results.length > 0) {
                    const location = geoData.results[0];
                    // Update detected location with the Localized Name (e.g., "北京市")
                    const newDetectedLoc = { city: location.name, ip: ip || 'Unknown' };
                    setDetectedLocation(newDetectedLoc);
                    fetchWeather(location.latitude, location.longitude, location.name, newDetectedLoc);
                } else {
                    // Fallback: if geocoding fails but we have a Chinese city name from Sohu, usage might be limited
                    // generally Open-Meteo handles Chinese names well.
                    console.warn(`Geocoding failed for ${cityName}`);
                    setError(`未找到城市: ${cityName}`);
                    setLoading(false);
                }
            } catch (e) {
                console.error("Geocoding failed", e);
                setError('定位服务不可用');
                setLoading(false);
            }
        } else {
            setError('无法获取位置');
            setLoading(false);
        }
    };

    const forceRefresh = () => {
        localStorage.removeItem(CACHE_KEY);
        setLoading(true);
        // Small timeout to ensure loading state is visible
        setTimeout(() => {
            if (config.mode === 'auto') {
                resolveLocationFromIP();
            } else if (config.lat && config.lon) {
                fetchWeather(config.lat, config.lon, config.city);
            }
        }, 300);
    };

    useEffect(() => {
        const loadWeather = async () => {
            // 1. Check Cache
            const cached = localStorage.getItem(CACHE_KEY);
            if (cached) {
                try {
                    const { timestamp, data, location, savedConfig } = JSON.parse(cached);
                    const isExpired = Date.now() - timestamp > CACHE_DURATION;
                    const isConfigMatch = JSON.stringify(savedConfig) === JSON.stringify(config);

                    if (!isExpired && isConfigMatch && data) {
                        console.log("Using cached weather data");
                        setWeather(data);
                        if (location) setDetectedLocation(location);
                        setLoading(false);
                        return;
                    }
                } catch (e) {
                    console.warn("Cache parse failed", e);
                    localStorage.removeItem(CACHE_KEY);
                }
            }

            // 2. Fetch if no valid cache
            if (config.mode === 'auto') {
                resolveLocationFromIP();
            } else if (config.lat && config.lon) {
                fetchWeather(config.lat, config.lon, config.city);
            } else {
                setLoading(false);
                setIsSettingsOpen(true);
            }
        };

        loadWeather();
    }, [config.mode, config.lat, config.lon]);

    // Only show full loading state if we have no weather data (initial load)
    // If we have weather data (refreshing), keep showing the UI so the settings modal doesn't unmount
    if (loading && !weather) {
        return (
            <div className="weather-container">
                <span className="weather-loading">更新中...</span>
            </div>
        );
    }

    return (
        <>
            <div className="weather-container" onClick={() => setIsSettingsOpen(true)} title="点击切换位置">
                <div className="weather-icon-wrapper">
                    {getWeatherIcon(weather?.code)}
                </div>
                <div className="weather-info">
                    <div className="weather-main-row">
                        <span className="weather-temp">{weather?.temp}°C</span>
                        <div className="weather-city-box">
                            <FiMapPin size={10} style={{ marginRight: '4px' }} />
                            <span className="weather-city-name">{weather?.city || '设置位置'}</span>
                        </div>
                    </div>
                    <div className="weather-sub-row">
                        <span className="weather-range">H: {weather?.max}° L: {weather?.min}°</span>
                    </div>
                </div>
            </div>

            <WeatherSettings
                isOpen={isSettingsOpen}
                onClose={() => setIsSettingsOpen(false)}
                detectedLocation={detectedLocation}
                onRefresh={forceRefresh}
                refreshing={loading}
            />
        </>
    );
};

export default Weather;
