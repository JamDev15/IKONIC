import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import MatrixBackground from './components/MatrixBackground';
import Navigation from './components/Navigation';
import HeroSection from './sections/HeroSection';
import ServicesSection from './sections/ServicesSection';
import AboutSection from './sections/AboutSection';
import TestimonialsSection from './sections/TestimonialsSection';
import ContactSection from './sections/ContactSection';
import About from './pages/About';
import Contact from './pages/Contact';
import AllServices from './pages/AllServices';
import LearnMore from './pages/LearnMore';
import CommercialWraps from './pages/CommercialWraps';
import Careers from './pages/Careers';
import Blogs from './pages/Blogs';
import WebDesign from './pages/WebDesign';
import CRMAutomation from './pages/CRMAutomation';
import ReputationManagement from './pages/ReputationManagement';
import SpeedToLead from './pages/SpeedToLead';
import MarketingSystems from './pages/MarketingSystems';
import './App.css';

gsap.registerPlugin(ScrollTrigger);

// Home page component
function HomePage() {
  return (
    <>
      <Navigation />
      <main className="relative z-10">
        <HeroSection />
        <ServicesSection />
        <AboutSection />
        <TestimonialsSection />
        <ContactSection />
      </main>
    </>
  );
}

function App() {
  useEffect(() => {
    ScrollTrigger.refresh();
    
    return () => {
      ScrollTrigger.getAll().forEach(st => st.kill());
    };
  }, []);

  return (
    <Router>
      <div className="relative bg-charcoal min-h-screen">
        <MatrixBackground />
        
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/services" element={<AllServices />} />
          <Route path="/learn-more" element={<LearnMore />} />
          <Route path="/commercial-wraps" element={<CommercialWraps />} />
          <Route path="/careers" element={<Careers />} />
          <Route path="/blogs" element={<Blogs />} />
          {/* Service Pages */}
          <Route path="/services/web-design" element={<WebDesign />} />
          <Route path="/services/crm-automation" element={<CRMAutomation />} />
          <Route path="/services/reputation" element={<ReputationManagement />} />
          <Route path="/services/speed-to-lead" element={<SpeedToLead />} />
          <Route path="/services/marketing" element={<MarketingSystems />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
