import React, { useState, useEffect } from 'react';
import { useAppStore } from '../store';
import './Clock.css';

const Clock = () => {
    const [time, setTime] = useState(new Date());
    const use24Hour = useAppStore((state) => state.settings.use24Hour);
    const toggleTimeFormat = useAppStore((state) => state.updateSettings);

    useEffect(() => {
        const timer = setInterval(() => {
            setTime(new Date());
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const formatTime = (date) => {
        return date.toLocaleTimeString('zh-CN', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: !use24Hour
        });
    };

    const formatDate = (date) => {
        return date.toLocaleDateString('zh-CN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            weekday: 'long'
        });
    };

    return (
        <div
            className="clock-container"
            onClick={() => toggleTimeFormat({ use24Hour: !use24Hour })}
            title="点击切换 12/24 小时制"
            style={{ cursor: 'pointer' }}
        >
            <div className="clock-time" key={use24Hour ? '24h' : '12h'}>
                {formatTime(time)}
            </div>
            <div className="clock-date">{formatDate(time)}</div>
        </div>
    );
};

export default Clock;
