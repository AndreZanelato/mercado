import React, { useEffect } from 'react';

const AdSenseBanner = ({ dataAdSlot, format = "auto", responsive = "true", style, className }) => {
    useEffect(() => {
        try {
            (window.adsbygoogle = window.adsbygoogle || []).push({});
        } catch (e) {
            console.error("AdSense error", e);
        }
    }, []);

    return (
        <div className={`ad-container text-center my-4 overflow-hidden ${className || ''}`}>
            <ins className="adsbygoogle"
                 style={{ display: 'block', ...style }}
                 data-ad-client="ca-pub-8344702989776517" 
                 data-ad-slot={dataAdSlot}
                 data-ad-format={format}
                 data-ad-full-width-responsive={responsive}></ins>
        </div>
    );
};

export default AdSenseBanner;