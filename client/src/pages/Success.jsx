import React from 'react';
import { useNavigate } from 'react-router-dom';

function Success() {
  const navigate = useNavigate();

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '4rem 2rem',
      textAlign: 'center',
      width: '100%',
      minHeight: 'calc(100vh - 120px)'
    }}>
      <div className="glass-panel" style={{
        maxWidth: '500px',
        padding: '3rem',
        borderRadius: '24px',
        border: '1px solid rgba(0, 230, 118, 0.2)',
        boxShadow: '0 10px 40px rgba(0, 230, 118, 0.05)'
      }}>
        <div style={{
          width: '80px',
          height: '80px',
          borderRadius: '50%',
          background: 'rgba(0, 230, 118, 0.1)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          margin: '0 auto 2rem auto',
          fontSize: '2.5rem',
          color: 'var(--success)'
        }}>
          ✓
        </div>
        
        <h1 style={{ fontSize: '2.2rem', fontWeight: 800, marginBottom: '1rem' }}>
          Order Confirmed!
        </h1>
        
        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', lineHeight: '1.6' }}>
          Thank you for your purchase. Your payment was successfully processed. We've sent a receipt and shipment tracking info to your email.
        </p>

        <div style={{
          background: 'rgba(255, 255, 255, 0.02)',
          borderRadius: '12px',
          padding: '1rem',
          border: '1px solid var(--border-color)',
          marginBottom: '2rem',
          textAlign: 'left'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Status:</span>
            <span style={{ color: 'var(--success)', fontWeight: 600 }}>PAID</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Method:</span>
            <span style={{ fontWeight: 600 }}>Stripe Credit Card</span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <button 
            onClick={() => navigate('/')}
            style={{
              background: 'transparent',
              color: 'var(--text-primary)',
              border: '1px solid var(--border-color)',
              padding: '0.8rem 1.5rem',
              borderRadius: '50px',
              cursor: 'pointer',
              fontWeight: 600
            }}>
            Go to Cinematic
          </button>
          <button 
            onClick={() => navigate('/store')}
            style={{
              background: 'var(--primary)',
              color: 'var(--text-primary)',
              border: 'none',
              padding: '0.8rem 1.5rem',
              borderRadius: '50px',
              cursor: 'pointer',
              fontWeight: 600
            }}>
            Continue Shopping
          </button>
        </div>
      </div>
    </div>
  );
}

export default Success;
