import { Outlet, Link } from 'react-router-dom';
import { Zap } from 'lucide-react';
import './LandingLayout.css';

const LandingLayout = () => {
  return (
    <div className="landing-layout">
      <header className="landing-nav animate-fade-in">
        <div className="container flex justify-between items-center nav-container">
          {/* Logo Section */}
          <Link to="/" className="brand-logo flex items-center gap-2">
            <Zap size={28} color="#00d2ff" />
            <span className="brand-text">BUZZER <span className="text-muted">BASKETBALL</span></span>
          </Link>
          
          {/* Center Links - Glassmorphism */}
          <nav className="nav-links glass-card">
            <Link to="/">Home</Link>
            <Link to="#about">About us</Link>
            <Link to="#features">Features</Link>
            <Link to="/dashboard">Dashboard (MVP)</Link>
          </nav>
          
          {/* CTA */}
          <div className="nav-actions">
            <Link to="/login" className="btn btn-glass">Login</Link>
          </div>
        </div>
      </header>

      <main className="landing-main">
        <Outlet />
      </main>
      
      <footer className="landing-footer">
        <div className="container">
          <p>EST 2015 &copy; Buzzer Basketball. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingLayout;
