import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Experience() {
  const navigate = useNavigate();
  const [phase, setPhase] = useState('welcome'); // 'welcome' | 'reveal' | 'configurator'

  const handleNextPhase = () => {
    if (phase === 'welcome') setPhase('reveal');
    else if (phase === 'reveal') setPhase('configurator');
  };

  const handleShopNow = () => {
    navigate('/store');
  };

  return (
    <div style={{
      position: 'relative',
      width: '100%',
      height: 'calc(100vh - 80px)',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '2rem',
      boxSizing: 'border-box'
    }}>
      {/* 3D Canvas Placeholder Area */}
      <div className="glass-panel" style={{
        position: 'absolute',
        top: '20px',
        bottom: '20px',
        left: '20px',
        right: '20px',
        zIndex: 1,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden'
      }}>
        {/* We will render R3F canvas components here later */}
        <div style={{ textAlign: 'center', opacity: 0.5 }}>
          <p style={{ fontSize: '1.2rem', letterSpacing: '2px', textTransform: 'uppercase' }}>
            [ React Three Fiber Canvas: Phase: {phase.toUpperCase()} ]
          </p>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
            Galaxy Cinematic 3D Scene loading...
          </p>
        </div>
      </div>

      {/* Cinematic Phase UI Overlay */}
      <div style={{
        zIndex: 10,
        textAlign: 'center',
        maxWidth: '600px',
        background: 'rgba(7, 7, 10, 0.75)',
        backdropFilter: 'blur(8px)',
        padding: '2rem 3rem',
        borderRadius: '24px',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5)'
      }}>
        {phase === 'welcome' && (
          <div>
            <h1 style={{ fontSize: '3rem', fontWeight: 800, marginBottom: '1rem', letterSpacing: '-1px' }}>
              Galaxy <span style={{ color: 'var(--primary)' }}>S26 Ultra</span>
            </h1>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', lineHeight: '1.6' }}>
              Welcome to the next era of mobile technology. Push the boundaries of productivity, photography, and gaming.
            </p>
            <button 
              onClick={handleNextPhase}
              style={{
                background: 'var(--primary)',
                color: 'var(--text-primary)',
                border: 'none',
                padding: '0.8rem 2rem',
                fontSize: '1rem',
                fontWeight: 600,
                borderRadius: '50px',
                cursor: 'pointer',
                transition: 'var(--transition-smooth)'
              }}>
              Discover Now
            </button>
          </div>
        )}

        {phase === 'reveal' && (
          <div>
            <h2 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '1rem' }}>
              Sleek. Strong. Titanium.
            </h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', lineHeight: '1.6' }}>
              Crafted with premium aerospace-grade titanium. Experience a lighter, stronger, and more resilient finish than ever before.
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <button 
                onClick={() => setPhase('welcome')}
                style={{
                  background: 'transparent',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border-color)',
                  padding: '0.8rem 2rem',
                  fontSize: '1rem',
                  fontWeight: 600,
                  borderRadius: '50px',
                  cursor: 'pointer'
                }}>
                Back
              </button>
              <button 
                onClick={handleNextPhase}
                style={{
                  background: 'var(--primary)',
                  color: 'var(--text-primary)',
                  border: 'none',
                  padding: '0.8rem 2rem',
                  fontSize: '1rem',
                  fontWeight: 600,
                  borderRadius: '50px',
                  cursor: 'pointer'
                }}>
                Configure
              </button>
            </div>
          </div>
        )}

        {phase === 'configurator' && (
          <div>
            <h2 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '1rem' }}>
              Personalize Yours
            </h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', lineHeight: '1.6' }}>
              Select your favorite color finish, storage capacity, and accessories. Experience your customized configuration in 3D.
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <button 
                onClick={() => setPhase('reveal')}
                style={{
                  background: 'transparent',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border-color)',
                  padding: '0.8rem 2rem',
                  fontSize: '1rem',
                  fontWeight: 600,
                  borderRadius: '50px',
                  cursor: 'pointer'
                }}>
                Back
              </button>
              <button 
                onClick={handleShopNow}
                style={{
                  background: 'var(--accent)',
                  color: '#000',
                  border: 'none',
                  padding: '0.8rem 2rem',
                  fontSize: '1rem',
                  fontWeight: 700,
                  borderRadius: '50px',
                  cursor: 'pointer'
                }}>
                Shop Now
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Experience;
