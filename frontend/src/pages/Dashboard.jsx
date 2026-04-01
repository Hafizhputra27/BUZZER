import { TrendingUp, Users, Target, Activity, Plus } from 'lucide-react';
import './Dashboard.css';

const Dashboard = () => {
  const stats = [
    { title: 'Active Campaigns', value: '12', trend: '+20%', icon: <Target size={24} color="#00d2ff" /> },
    { title: 'Total Tasks', value: '840', trend: '+15%', icon: <Activity size={24} color="#1a73e8" /> },
    { title: 'Active Buzzers', value: '256', trend: '+5%', icon: <Users size={24} color="#ffb142" /> },
    { title: 'Engagement Rate', value: '8.4%', trend: '+1.2%', icon: <TrendingUp size={24} color="#2ecc71" /> },
  ];

  const recentCampaigns = [
    { id: 1, title: 'Nike Hoops Release', client: 'Nike Indonesia', status: 'Active', progress: 75, deadline: '2 Days' },
    { id: 2, title: 'DBL Promo Tiket', client: 'DBL', status: 'Active', progress: 40, deadline: '5 Days' },
    { id: 3, title: 'Hoops Station Sale', client: 'Hoops Indonesia', status: 'Completed', progress: 100, deadline: 'Done' },
    { id: 4, title: 'Sponsorship Bima Perkasa', client: 'Bima Perkasa Jogja', status: 'Active', progress: 10, deadline: '14 Days' },
  ];

  return (
    <div className="dashboard-overview animate-fade-in">
      <div className="dashboard-header flex justify-between items-center">
        <div>
          <h1 className="page-title">Overview</h1>
          <p className="text-muted text-sm">Welcome back, Admin! Here's your campaign performance.</p>
        </div>
        <button className="btn btn-primary">
          <Plus size={18} /> Create Campaign
        </button>
      </div>

      <div className="stats-grid">
        {stats.map((stat, i) => (
          <div key={i} className="stat-card glass-card flex justify-between items-center">
            <div>
              <p className="stat-title text-muted">{stat.title}</p>
              <h3 className="stat-value">{stat.value}</h3>
              <span className="stat-trend">{stat.trend} from last month</span>
            </div>
            <div className="stat-iconwrapper">
              {stat.icon}
            </div>
          </div>
        ))}
      </div>

      <div className="campaigns-section glass-card">
        <div className="section-header flex justify-between items-center">
          <h3 className="section-title">Recent Campaigns</h3>
          <button className="text-btn">View All</button>
        </div>
        
        <table className="campaigns-table">
          <thead>
            <tr>
              <th>Campaign Name</th>
              <th>Client</th>
              <th>Status</th>
              <th>Progress</th>
              <th>Deadline</th>
            </tr>
          </thead>
          <tbody>
            {recentCampaigns.map((camp) => (
              <tr key={camp.id}>
                <td className="font-semibold">{camp.title}</td>
                <td className="text-muted">{camp.client}</td>
                <td>
                   <span className={`status-badge ${camp.status.toLowerCase()}`}>
                     {camp.status}
                   </span>
                </td>
                <td>
                  <div className="progress-bar-bg">
                    <div 
                      className="progress-bar-fill" 
                      style={{ width: `${camp.progress}%`, backgroundColor: camp.progress === 100 ? '#2ecc71' : '#1a73e8' }}
                    ></div>
                  </div>
                  <span className="text-xs text-muted block mt-1">{camp.progress}% Done</span>
                </td>
                <td className="text-muted">{camp.deadline}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Dashboard;
