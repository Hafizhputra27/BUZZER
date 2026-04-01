import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Share2, Mail, BarChart2, Users } from 'lucide-react';
import './Landing.css';

const features = [
  {
    icon: <Share2 size={28} />,
    title: 'Campaign Distribution',
    desc: 'Distribute campaign briefs to your buzzer network instantly with automated assignment workflows.',
  },
  {
    icon: <Mail size={28} />,
    title: 'Email Automation',
    desc: 'Automatically notify buzzers via email the moment they are assigned to a new campaign.',
  },
  {
    icon: <BarChart2 size={28} />,
    title: 'Real-time Tracking',
    desc: 'Monitor submission status and campaign progress in real-time from your admin dashboard.',
  },
  {
    icon: <Users size={28} />,
    title: 'Buzzer Management',
    desc: 'Manage your entire buzzer roster, review submissions, and approve or reject results with ease.',
  },
];

const Landing = () => {
  return (
    <div className="landing-page">
      {/* Navbar */}
      <nav className="landing-nav">
        <div className="nav-inner container flex items-center justify-between">
          <Link to="/" className="nav-logo">
            <img src="/logobuzzer.png" alt="Buzzer Basketball" className="logo-img" />
          </Link>
          <div className="nav-links flex gap-4">
            <Link to="/login" className="nav-link">Login</Link>
            <Link to="/register" className="btn btn-primary nav-cta">Register</Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-bg-blur" />
        <div className="hero-bg-ball" />
        <div className="container hero-content flex-col items-center">
          <motion.div
            className="hero-inner flex-col items-center"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
          >
            <span className="hero-badge">🏀 Basketball Campaign Platform</span>
            <h1 className="hero-title text-gradient">
              Smart Buzzer Campaign<br />Management Platform
            </h1>
            <p className="hero-subtitle text-muted">
              Distribute campaigns, automate email notifications, and track buzzer performance — all in one powerful platform.
            </p>
            <div className="hero-actions flex gap-4">
              <Link to="/register?role=admin" className="btn btn-primary btn-lg">
                Start Campaign
              </Link>
              <Link to="/register?role=buzzer" className="btn btn-glass btn-lg">
                Join as Buzzer
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="container flex-col items-center">
          <h2 className="features-heading text-gradient">Everything You Need</h2>
          <p className="features-sub text-muted">
            A complete toolkit for managing buzzer campaigns at scale.
          </p>
          <div className="features-grid">
            {features.map((f, i) => (
              <div key={i} className="feature-card glass-card">
                <div className="feature-icon">{f.icon}</div>
                <h3 className="feature-title">{f.title}</h3>
                <p className="feature-desc text-muted">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="footer-cta">
        <div className="container flex-col items-center">
          <h2 className="footer-cta-title text-gradient">Ready to get started?</h2>
          <div className="flex gap-4">
            <Link to="/register?role=admin" className="btn btn-primary btn-lg">Start Campaign</Link>
            <Link to="/register?role=buzzer" className="btn btn-glass btn-lg">Join as Buzzer</Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Landing;
