import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ImageSlider from '../components/ImageSlider';
import ComponentsSection from '../components/ComponentsSection';
import StatisticsSection from '../components/StatisticsSection';

const NewSite = () => {
    return (
        <>
            <Header />
            <main className="container" style={{ padding: 'var(--space-8)' }}>
                {/* Reuse same sections as Home */}
                <ImageSlider />
                <ComponentsSection />
                <StatisticsSection />
            </main>
            <Footer />
        </>
    );
};

export default NewSite;
