import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Experience from './pages/Experience';
import Store from './pages/Store';
import Checkout from './pages/Checkout';
import Success from './pages/Success';
import ChatWidget from './components/chatbot/ChatWidget';

function App() {
  return (
    <Router>
      <div className="app-container" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <header className="glass-panel" style={{
          position: 'sticky',
          top: 0,
          zIndex: 100,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '1rem 2rem',
          margin: '10px',
          borderRadius: '12px'
        }}>
          <Link to="/" style={{ color: 'var(--text-primary)', textDecoration: 'none', fontWeight: 800, fontSize: '1.25rem', letterSpacing: '1px' }}>
            SAMSUNG <span style={{ color: 'var(--primary)' }}>GALAXY</span>
          </Link>
          <nav style={{ display: 'flex', gap: '1.5rem' }}>
            <Link to="/" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontWeight: 500, transition: 'var(--transition-smooth)' }} onMouseOver={(e) => e.target.style.color = 'var(--text-primary)'} onMouseOut={(e) => e.target.style.color = 'var(--text-secondary)'}>Cinematic</Link>
            <Link to="/store" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontWeight: 500, transition: 'var(--transition-smooth)' }} onMouseOver={(e) => e.target.style.color = 'var(--text-primary)'} onMouseOut={(e) => e.target.style.color = 'var(--text-secondary)'}>Store</Link>
            <Link to="/checkout" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontWeight: 500, transition: 'var(--transition-smooth)' }} onMouseOver={(e) => e.target.style.color = 'var(--text-primary)'} onMouseOut={(e) => e.target.style.color = 'var(--text-secondary)'}>Checkout</Link>
          </nav>
        </header>

        <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <Routes>
            <Route path="/" element={<Experience />} />
            <Route path="/store" element={<Store />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/success" element={<Success />} />
          </Routes>
        </main>

        <ChatWidget />
      </div>
    </Router>
  );
}

export default App;
