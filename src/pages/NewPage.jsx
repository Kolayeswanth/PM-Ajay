import React from 'react';
import ImageSlider from '../components/ImageSlider';

const NewPage = () => {
    const images = [
        '/logos/banner-1.jpg',
        '/logos/banner-2.jpg',
        '/logos/banner-3.jpg',
    ];

    return (
        <>
            <ImageSlider images={images} />
            <div className="container" style={{ padding: 'var(--space-8)' }}>
                <h1>Welcome to the New Page</h1>
                <p>This page uses the shared Header and Footer via AppLayout.</p>
                {/* Add additional content here */}
            </div>
        </>
    );
};

export default NewPage;
