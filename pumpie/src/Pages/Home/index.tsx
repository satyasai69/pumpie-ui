import React from 'react';
import { NavBar } from '@/components/Blocks/Navbar';
import Hero from '@/components/Blocks/Hero';
import Features from '@/components/Blocks/Features';
import About from '@/components/Blocks/About';
import { Footer } from '@/components/Blocks/Footer';
import './home.css';

const Home: React.FC = () => {
  return (
    <div className="h-screen overflow-hidden bg-white">
      <NavBar />
      
      <div className="horizontal-scroll-container">
        <div className="horizontal-sections">
          <section id="hero" className="horizontal-section">
            <Hero />
          </section>
          
          <section id="features" className="horizontal-section">
            <Features />
          </section>
          
          <section id="about" className="horizontal-section">
            <About />
          </section>

          <section id="footer" className="horizontal-section">
            <Footer />
          </section>
        </div>
      </div>
    </div>
  );
};

export default Home;
