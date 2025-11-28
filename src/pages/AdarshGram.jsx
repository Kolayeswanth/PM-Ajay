import React from 'react';
import Header from '../components/Header';
import ImageSlider from '../components/ImageSlider';
import MonitorableIndicators from '../components/MonitorableIndicators';
import Footer from '../components/Footer';

const AdarshGram = () => {
    const images = [
        '/logos/banner-1.jpg',
        '/logos/banner-2.jpg',
        '/logos/banner-3.jpg',
    ];

    return (
        <div className="page-wrapper">
            <Header />
            <ImageSlider images={images} />
            <div className="page-content">
                <MonitorableIndicators />
            </div>
            <Footer />
        </div>
    );
};

export default AdarshGram;
