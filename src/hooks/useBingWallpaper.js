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

    useEffect(() => {
        const fetchBingImage = async () => {
            const cacheKey = 'bing_wallpaper_cache_v1';
            // Use local date string to identify "today". 
            // If the user opens the app tomorrow, this string will differ, triggering a new fetch.
            const todayStr = new Date().toDateString();

            // 1. Try to load from cache first
            try {
                const cachedRaw = localStorage.getItem(cacheKey);
                if (cachedRaw) {
                    const cachedData = JSON.parse(cachedRaw);
                    // Check if cache is from today
                    if (cachedData.fetchDate === todayStr) {
                        console.log('🎨 Using cached Bing Wallpaper:', cachedData.url);
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
                console.log('🌍 Fetching new Bing Wallpaper from network...');

                // Using bing.biturl.top as primary JSON source (more reliable than github raw proxies)
                const response = await fetch('https://bing.biturl.top/?resolution=1920&format=json&index=0&mkt=zh-CN');

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

                    detailObj = {
                        title: title,
                        copyright: fullCopyright,
                        copyrightlink: data.copyright_link,
                        date: data.end_date || todayStr
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
                        date: todayImage.enddate
                    };
                } else {
                    throw new Error('Invalid data format from Bing API');
                }

                console.log('✅ New Wallpaper URL:', imageUrl);

                setBackgroundUrl(imageUrl);
                setBingDetail(detailObj);

                // 3. Save to cache
                localStorage.setItem(cacheKey, JSON.stringify({
                    fetchDate: todayStr,
                    url: imageUrl,
                    detail: detailObj
                }));

            } catch (err) {
                console.error('Error fetching Bing wallpaper:', err);
                setError(err);
                // Fallback: Direct biturl link or just keep empty (allowing CSS gradient fallback)
                // Let's set a reliable direct link as fallback just in case
                const fallbackUrl = 'https://bing.biturl.top/?resolution=1920&format=image&index=0&mkt=zh-CN';
                console.log('⚠️ Using Fallback Wallpaper:', fallbackUrl);
                setBackgroundUrl(fallbackUrl);
            } finally {
                setLoading(false);
            }
        };

        fetchBingImage();
    }, []);

    return { backgroundUrl, bingDetail, loading, error };
};

export default useBingWallpaper;
