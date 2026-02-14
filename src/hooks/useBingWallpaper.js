import { useState, useEffect } from 'react';

/**
 * Custom hook to fetch the daily Bing wallpaper.
 * Uses a proxy to avoid CORS issues and get reliable daily images.
 * Default fallback is provided if fetch fails.
 * 
 * @returns {Object} { backgroundUrl, bingDetail, loading, error }
 */
const useBingWallpaper = () => {
    const [backgroundUrl, setBackgroundUrl] = useState('');
    const [bingDetail, setBingDetail] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [dayOffset, setDayOffset] = useState(0); // 0 = today, 1 = yesterday, etc.

    useEffect(() => {
        const fetchBingImage = async () => {
            const cacheKey = `bing_wallpaper_cache_v2_${dayOffset}`;
            // Use local date string to identify "today" for this specific offset
            const referenceDate = new Date();
            referenceDate.setDate(referenceDate.getDate() - dayOffset);
            const dateStr = referenceDate.toDateString();

            // 1. Try to load from cache first
            try {
                const cachedRaw = localStorage.getItem(cacheKey);
                if (cachedRaw) {
                    const cachedData = JSON.parse(cachedRaw);
                    // Check if cache is for the correct date
                    if (cachedData.fetchDate === dateStr) {
                        console.log(`🎨 Using cached Bing Wallpaper (Offset ${dayOffset}):`, cachedData.url);
                        setBackgroundUrl(cachedData.url);
                        setBingDetail(cachedData.detail);
                        setLoading(false);
                        return; // Skip network request
                    }
                }
            } catch (e) {
                console.warn('Failed to parse wallpaper cache:', e);
                localStorage.removeItem(cacheKey);
            }

            // 2. Fetch from network if cache is missing or stale
            try {
                setLoading(true);
                setError(null);
                console.log(`🌍 Fetching Bing Wallpaper (Offset ${dayOffset}) from network...`);

                // Using bing.biturl.top as primary JSON source (more reliable than github raw proxies)
                // Pass 'index' parameter for history (0=today, 1=yesterday, etc.)
                const response = await fetch(`https://bing.biturl.top/?resolution=1920&format=json&index=${dayOffset}&mkt=zh-CN`);

                if (!response.ok) {
                    throw new Error('Failed to fetch Bing daily image');
                }

                const data = await response.json();
                let imageUrl, detailObj;

                // Handle different JSON structures
                if (data && data.url) {
                    // Logic for bing.biturl.top (Flat structure)
                    imageUrl = data.url;

                    // biturl.top usually aggregates title and copyright into 'copyright' field
                    // We can try to extract title if possible, or just use copyright for both
                    const fullCopyright = data.copyright || '';
                    const titleParts = fullCopyright.split('(');
                    const title = titleParts[0] ? titleParts[0].trim() : 'Daily Wallpaper';

                    // API date can be flaky or in YYYYMMDD format which is hard to parse reliably across browsers.
                    // Since we requested a specific index (dayOffset), we know exactly what date this wallpaper represents.
                    // So we use the calculated `dateStr` as the source of truth for the UI.

                    detailObj = {
                        title: title,
                        copyright: fullCopyright,
                        copyrightlink: data.copyright_link,
                        date: dateStr // Always use the calculated valid date
                    };

                } else if (data && data.images && data.images.length > 0) {
                    // Logic for standard Bing JSON (e.g. if we switch back to official API or compatible proxy)
                    const todayImage = data.images[0];
                    imageUrl = todayImage.url;
                    if (!imageUrl.startsWith('http')) {
                        imageUrl = `https://www.bing.com${imageUrl}`;
                    }

                    detailObj = {
                        title: todayImage.title,
                        copyright: todayImage.copyright,
                        copyrightlink: todayImage.copyrightlink,
                        date: dateStr // Use calculated date
                    };
                } else {
                    throw new Error('Invalid data format from Bing API');
                }

                console.log('✅ New Wallpaper URL:', imageUrl);

                setBackgroundUrl(imageUrl);
                setBingDetail(detailObj);

                // 3. Save to cache
                localStorage.setItem(cacheKey, JSON.stringify({
                    fetchDate: dateStr,
                    url: imageUrl,
                    detail: detailObj
                }));

            } catch (err) {
                console.error('Error fetching Bing wallpaper:', err);
                setError(err);
                // Fallback: Direct biturl link or just keep empty (allowing CSS gradient fallback)
                // Let's set a reliable direct link as fallback just in case
                const fallbackUrl = `https://bing.biturl.top/?resolution=1920&format=image&index=${dayOffset}&mkt=zh-CN`;
                console.log('⚠️ Using Fallback Wallpaper:', fallbackUrl);
                setBackgroundUrl(fallbackUrl);
            } finally {
                setLoading(false);
            }
        };

        fetchBingImage();
    }, [dayOffset]); // Re-run when dayOffset changes

    const MAX_DAYS = 7; // API only supports up to 7 days of history

    const prevDay = () => setDayOffset(prev => Math.min(prev + 1, MAX_DAYS));
    const nextDay = () => setDayOffset(prev => Math.max(0, prev - 1));

    return {
        backgroundUrl,
        bingDetail,
        loading,
        error,
        dayOffset,
        maxDays: MAX_DAYS,
        prevDay,
        nextDay
    };
};

export default useBingWallpaper;
