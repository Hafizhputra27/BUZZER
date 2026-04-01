import { Component } from 'react';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('ErrorBoundary caught:', error, info);
  }

  handleReload() {
    window.location.reload();
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'var(--bg-color)',
            padding: '24px',
          }}
        >
          <div className="glass-card" style={{ maxWidth: '480px', width: '100%', textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: '16px' }}>⚠️</div>
            <h2 style={{ fontFamily: 'Outfit, sans-serif', marginBottom: '12px', color: 'var(--text-main)' }}>
              Terjadi Kesalahan
            </h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '8px', fontSize: '0.9rem' }}>
              {this.state.error?.message || 'Sesuatu yang tidak terduga terjadi.'}
            </p>
            <p style={{ color: 'var(--text-muted)', marginBottom: '24px', fontSize: '0.85rem' }}>
              Coba muat ulang halaman untuk melanjutkan.
            </p>
            <button
              className="btn btn-primary"
              onClick={this.handleReload}
              style={{ width: '100%' }}
            >
              Muat Ulang
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
