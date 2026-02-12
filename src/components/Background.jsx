import React from 'react';
import useBingWallpaper from '../hooks/useBingWallpaper';

export default function Background() {
    const { backgroundUrl, bingDetail } = useBingWallpaper();

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
                            transition: 'opacity 1s ease-in-out'
                        }}
                    />
                )}
            </div>

            {/* Dark Overlay using mixed-blend-mode or simple opacity for better text contrast */}
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

            {/* Image Credit */}
            {bingDetail && (
                <div
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
