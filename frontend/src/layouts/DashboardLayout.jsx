import { Outlet, Link, useLocation } from 'react-router-dom';
import { Home, LayoutDashboard, Megaphone, Users, BarChart3, Settings, Bell, Search, Zap } from 'lucide-react';
import './DashboardLayout.css';

const DashboardLayout = () => {
  const location = useLocation();

  const navItems = [
    { path: '/dashboard', icon: <LayoutDashboard size={20} />, label: 'Overview' },
    { path: '/dashboard/campaigns', icon: <Megaphone size={20} />, label: 'Campaigns' },
    { path: '/dashboard/buzzers', icon: <Users size={20} />, label: 'Buzzer Network' },
    { path: '/dashboard/analytics', icon: <BarChart3 size={20} />, label: 'Analytics' },
    { path: '/dashboard/settings', icon: <Settings size={20} />, label: 'Settings' },
  ];

  return (
    <div className="dashboard-layout">
      {/* Sidebar */}
      <aside className="sidebar flex-col">
        <div className="sidebar-header flex items-center gap-2">
          <Zap size={24} color="#00d2ff" />
          <span className="brand-text">BUZZER <span className="text-muted">BB</span></span>
        </div>
        
        <nav className="sidebar-nav flex-col">
          {navItems.map((item) => (
            <Link 
              key={item.path} 
              to={item.path} 
              className={`nav-item flex items-center gap-4 ${location.pathname === item.path ? 'active' : ''}`}
            >
              {item.icon}
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="sidebar-footer">
          <Link to="/" className="nav-item flex items-center gap-4 text-muted">
            <Home size={20} />
            <span>Back to Site</span>
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <div className="dashboard-main-wrapper flex-col">
        {/* Topbar */}
        <header className="topbar flex items-center justify-between">
          <div className="search-bar flex items-center gap-2">
            <Search size={18} className="text-muted" />
            <input type="text" placeholder="Search campaigns, buzzers..." />
          </div>
          
          <div className="topbar-actions flex items-center gap-6">
            <button className="icon-btn">
              <Bell size={20} />
              <span className="notification-badge"></span>
            </button>
            <div className="user-profile flex items-center gap-3">
              <div className="avatar">AD</div>
              <div className="user-info">
                <span className="user-name">Admin</span>
                <span className="user-role text-muted">Administrator</span>
              </div>
            </div>
          </div>
        </header>

        {/* Dynamic Outlet */}
        <main className="dashboard-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
