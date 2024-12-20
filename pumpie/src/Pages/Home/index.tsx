import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTonConnectUI } from '@tonconnect/ui-react';
import Hero from '@/components/Blocks/Hero';
import Features from '@/components/Blocks/Features';
import About from '@/components/Blocks/About';
import { Footer } from '@/components/Blocks/Footer';
import './home.css';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const [tonConnectUI] = useTonConnectUI();

  useEffect(() => {
    // Redirect to dashboard if already connected
    if (tonConnectUI.connected) {
      navigate('/dashboard', { replace: true });
    }
  }, [tonConnectUI.connected, navigate]);

  // If not connected, show the home page
  return (
    <div className="h-screen overflow-hidden bg-white">
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
