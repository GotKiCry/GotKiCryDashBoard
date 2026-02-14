import React, { useState } from 'react';
import useBingWallpaper from '../hooks/useBingWallpaper';
import { FaChevronLeft, FaChevronRight, FaCalendarAlt, FaSpinner } from 'react-icons/fa';

export default function Background() {
    const { backgroundUrl, bingDetail, loading, dayOffset, maxDays, prevDay, nextDay } = useBingWallpaper();
    const [isHovered, setIsHovered] = useState(false);

    // Format date for display
    const formatDate = (dateString) => {
        if (!dateString) return '';
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) {
                return dateString; // Return original if parsing fails
            }
            return date.toLocaleDateString('zh-CN', { month: 'long', day: 'numeric' });
        } catch (e) {
            return dateString;
        }
    };

    return (
        <>
            <div
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    zIndex: -2,
                    backgroundColor: '#000', // Fallback
                }}
            >
                {backgroundUrl && (
                    <img
                        src={backgroundUrl}
                        alt="Bing Daily Wallpaper"
                        style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            opacity: 0.9,
                            transition: 'opacity 0.5s ease-in-out' // Faster transition for switching
                        }}
                    />
                )}
            </div>

            {/* Dark Overlay */}
            <div
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    backgroundColor: 'rgba(0, 0, 0, 0.25)',
                    zIndex: -1,
                    pointerEvents: 'none'
                }}
            />

            {/* Vignette effect */}
            <div className="radial-vignette" />

            {/* Controls & Info Container */}
            <div
                style={{
                    position: 'fixed',
                    bottom: '20px',
                    left: '20px',
                    zIndex: 20,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    gap: '8px',
                    opacity: isHovered ? 1 : 0.4,
                    transition: 'opacity 0.3s ease',
                    pointerEvents: 'auto'
                }}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                {/* Navigation Buttons */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    background: 'rgba(0,0,0,0.3)',
                    backdropFilter: 'blur(10px)',
                    padding: '8px 12px',
                    borderRadius: '24px',
                    border: '1px solid rgba(255,255,255,0.1)'
                }}>
                    <button
                        onClick={prevDay}
                        disabled={loading || dayOffset >= maxDays}
                        className="glass-btn-icon"
                        title={dayOffset >= maxDays ? "已到最早记录" : "上一张壁纸"}
                        style={{ color: 'white', background: 'transparent', border: 'none', cursor: dayOffset >= maxDays ? 'default' : 'pointer', opacity: dayOffset >= maxDays ? 0.3 : 1, display: 'flex' }}
                    >
                        <FaChevronLeft size={16} />
                    </button>

                    <div style={{
                        color: 'white',
                        fontSize: '0.9rem',
                        fontWeight: 500,
                        minWidth: '80px',
                        textAlign: 'center',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px'
                    }}>
                        {loading ? (
                            <>
                                <FaSpinner size={12} className="animate-spin" />
                                <span>加载中...</span>
                            </>
                        ) : (
                            <>
                                <FaCalendarAlt size={12} style={{ opacity: 0.7 }} />
                                <span>{dayOffset === 0 ? '今日' : formatDate(bingDetail?.date)}</span>
                            </>
                        )}
                    </div>

                    <button
                        onClick={nextDay}
                        disabled={loading || dayOffset === 0}
                        className="glass-btn-icon"
                        title="下一张壁纸"
                        style={{
                            color: 'white',
                            background: 'transparent',
                            border: 'none',
                            cursor: dayOffset === 0 ? 'default' : 'pointer',
                            opacity: dayOffset === 0 ? 0.3 : 1,
                            display: 'flex'
                        }}
                    >
                        <FaChevronRight size={16} />
                    </button>
                </div>
            </div>

            {/* Image Credit (Moved to align generally but keeping original position logic or integrated) */}
            {bingDetail && (
                <div
                    className="bing-wallpaper-detail"
                    style={{
                        position: 'fixed',
                        bottom: '10px',
                        right: '20px',
                        color: 'rgba(255,255,255,0.7)',
                        fontSize: '0.75rem',
                        zIndex: 10,
                        textShadow: '0 1px 4px rgba(0,0,0,0.8)',
                        pointerEvents: 'none',
                        fontFamily: 'sans-serif',
                        maxWidth: '50vw',
                        textAlign: 'right',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                    }}
                >
                    <span title={bingDetail.title} style={{ fontWeight: 500 }}>{bingDetail.title}</span>
                    {bingDetail.copyright && (
                        <span style={{ opacity: 0.8, marginLeft: '8px' }}>
                            © {bingDetail.copyright.replace(/\(©.*/, '')}
                        </span>
                    )}
                </div>
            )}
        </>
    );
}
