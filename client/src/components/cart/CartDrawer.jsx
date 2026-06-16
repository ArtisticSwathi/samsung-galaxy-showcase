import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { incrementQuantity, decrementQuantity, removeFromCart } from '../../store/cartSlice';
import { useNavigate } from 'react-router-dom';

function CartDrawer({ isOpen, onClose }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items: cartItems, totalAmount } = useSelector((state) => state.cart);

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      zIndex: 200,
      display: 'flex',
      justifyContent: 'flex-end',
      background: 'rgba(0, 0, 0, 0.6)',
      backdropFilter: 'blur(4px)'
    }}>
      {/* Overlay to close drawer */}
      <div 
        onClick={onClose} 
        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 1 }}
      />

      {/* Drawer content */}
      <div className="glass-panel" style={{
        position: 'relative',
        zIndex: 2,
        width: '100%',
        maxWidth: '450px',
        height: '100%',
        borderLeft: '1px solid var(--border-color)',
        borderRadius: '24px 0 0 24px',
        background: 'rgba(12, 12, 18, 0.95)',
        padding: '2rem',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        boxShadow: '-10px 0 40px rgba(0, 0, 0, 0.5)'
      }}>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 700 }}>Your Cart</h2>
            <button 
              onClick={onClose}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-secondary)',
                fontSize: '1.5rem',
                cursor: 'pointer'
              }}>
              ✕
            </button>
          </div>

          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '1.5rem',
            maxHeight: 'calc(100vh - 280px)',
            overflowY: 'auto',
            paddingRight: '0.5rem'
          }}>
            {cartItems.length === 0 ? (
              <p style={{ color: 'var(--text-secondary)', textAlign: 'center', marginTop: '2rem' }}>
                Your cart is empty.
              </p>
            ) : (
              cartItems.map((item) => (
                <div 
                  key={item._id} 
                  style={{
                    display: 'flex',
                    gap: '1rem',
                    padding: '1rem',
                    background: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '12px',
                    alignItems: 'center'
                  }}>
                  <div style={{ fontSize: '2rem' }}>📱</div>
                  <div style={{ flex: 1 }}>
                    <h4 style={{ fontWeight: 600, fontSize: '1rem' }}>{item.name}</h4>
                    <p style={{ color: 'var(--accent)', fontWeight: 700, fontSize: '0.9rem', marginTop: '0.2rem' }}>
                      ${item.price}
                    </p>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginTop: '0.5rem' }}>
                      <button 
                        onClick={() => dispatch(decrementQuantity(item._id))}
                        style={{
                          background: 'rgba(255,255,255,0.05)',
                          border: 'none',
                          color: 'var(--text-primary)',
                          width: '24px',
                          height: '24px',
                          borderRadius: '4px',
                          cursor: 'pointer'
                        }}>
                        -
                      </button>
                      <span>{item.quantity}</span>
                      <button 
                        onClick={() => dispatch(incrementQuantity(item._id))}
                        style={{
                          background: 'rgba(255,255,255,0.05)',
                          border: 'none',
                          color: 'var(--text-primary)',
                          width: '24px',
                          height: '24px',
                          borderRadius: '4px',
                          cursor: 'pointer'
                        }}>
                        +
                      </button>
                    </div>
                  </div>
                  <button 
                    onClick={() => dispatch(removeFromCart(item._id))}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: 'var(--error)',
                      cursor: 'pointer',
                      fontSize: '0.9rem'
                    }}>
                    Remove
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        <div>
          <div style={{ height: '1px', background: 'var(--border-color)', margin: '1.5rem 0' }}></div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <span style={{ fontSize: '1.1rem', color: 'var(--text-secondary)' }}>Subtotal</span>
            <span style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--accent)' }}>
              ${totalAmount.toFixed(2)}
            </span>
          </div>

          <button 
            onClick={() => {
              onClose();
              navigate('/checkout');
            }}
            disabled={cartItems.length === 0}
            style={{
              width: '100%',
              background: 'var(--primary)',
              color: 'var(--text-primary)',
              border: 'none',
              padding: '1rem',
              borderRadius: '12px',
              fontWeight: 600,
              fontSize: '1.1rem',
              cursor: 'pointer',
              opacity: cartItems.length === 0 ? 0.5 : 1
            }}>
            Proceed to Checkout
          </button>
        </div>
      </div>
    </div>
  );
}

export default CartDrawer;
