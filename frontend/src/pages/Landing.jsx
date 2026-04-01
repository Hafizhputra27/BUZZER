import { ArrowRight, Activity, Users, Zap, CheckCircle } from 'lucide-react';
import './Landing.css';

const Landing = () => {
  return (
    <div className="landing-page animate-fade-in">
      {/* Hero Section */}
      <section className="hero-section flex items-center justify-center">
        <div className="container flex-col items-center">
          
          <div className="status-badge flex gap-2 items-center text-muted">
            <span className="live-dot"></span>
            Registered Trademark
          </div>
          
          <h1 className="hero-title text-gradient">
            Amplify Brand<br />With Top Buzzers
          </h1>
          
          <p className="hero-subtitle text-muted">
            With world-class digital management, cutting-edge analytics, and a relentless spirit, 
            Buzzer Basketball pushes engagement limits, sharpens reach, and ignites passion in every campaign.
          </p>
          
          <div className="hero-actions flex gap-4">
            <button className="btn btn-primary lg">
              Start Campaign <ArrowRight size={20} />
            </button>
          </div>

          <div className="tags flex gap-4">
            <span className="glass-tag">[daily metrics]</span>
            <span className="glass-tag">[viral reach]</span>
            <span className="glass-tag">[active buzzers]</span>
            <span className="glass-tag">[expert analytics]</span>
          </div>
          
          {/* Glass Card Floating Feature (Similar to Tenvibe design) */}
          <div className="floating-preview glass-card flex items-center gap-6 animate-fade-in delay-2">
            <div className="preview-icon">
              <Zap size={32} color="#00d2ff" />
            </div>
            <div>
              <h3 className="preview-title">Buzzer Basketball</h3>
              <p className="text-muted text-sm">Our platform is more than an app. It's a lifestyle of promotion.</p>
            </div>
          </div>

        </div>
      </section>

      {/* Philosophy Section */}
      <section className="philosophy-section container">
        <div className="philosophy-content flex-col items-center text-center">
          <div className="icon-wrapper">
             <Activity size={48} color="white" />
          </div>
          <h2 className="philosophy-text">
            At <strong>Buzzer Basketball</strong> we believe promotion is more than <span className="highlight-tag"><Users size={20}/> a task</span><br/>
            it's a journey of <strong>discipline</strong>, passion, and rapid growth.<br/>
            Our mission is to <span className="highlight-tag"><CheckCircle size={20} color="#00d2ff" /> empower</span> brands of all levels with <br/>
            <strong>world-class digital presence</strong> in an environment<br/> built to inspire excellence.
          </h2>
        </div>
      </section>
    </div>
  );
};

export default Landing;
