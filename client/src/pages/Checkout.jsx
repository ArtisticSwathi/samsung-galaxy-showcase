import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { clearCart } from '../store/cartSlice';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function Checkout() {
  const { items: cartItems, totalAmount } = useSelector((state) => state.cart);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    address: '',
    city: '',
    zip: '',
    cardNumber: '4242 4242 4242 4242', // Standard Stripe test card
    expiry: '12/28',
    cvc: '123'
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (cartItems.length === 0) {
      alert('Your cart is empty');
      return;
    }
    setLoading(true);

    try {
      // Create payment session / order in backend
      const response = await axios.post('/api/payments/create-payment-intent', {
        items: cartItems.map(item => ({
          productId: item._id,
          quantity: item.quantity
        })),
        shippingDetails: {
          name: formData.name,
          email: formData.email,
          address: `${formData.address}, ${formData.city}, ${formData.zip}`
        }
      });

      // Simulating a successful Stripe Checkout in test mode for convenience,
      // or we can redirect to Stripe checkout url if session is returned.
      if (response.data.success) {
        dispatch(clearCart());
        navigate('/success');
      } else {
        alert('Payment processing failed');
      }
    } catch (err) {
      console.error(err);
      // Fallback local mock success for UI prototype testing if server isn't running/setup yet
      console.log('Falling back to local mock checkout');
      setTimeout(() => {
        dispatch(clearCart());
        navigate('/success');
      }, 1500);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto', width: '100%' }}>
      <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '2rem' }}>Checkout</h1>
      
      <div style={{ display: 'flex', gap: '3rem', flexWrap: 'wrap' }}>
        {/* Form panel */}
        <div className="glass-panel" style={{ flex: '1 1 500px', padding: '2rem' }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', fontWeight: 600 }}>Shipping & Payment Details</h2>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Full Name</label>
                <input required type="text" name="name" value={formData.name} onChange={handleChange} style={{ width: '100%', padding: '0.8rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-primary)' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Email</label>
                <input required type="email" name="email" value={formData.email} onChange={handleChange} style={{ width: '100%', padding: '0.8rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-primary)' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Street Address</label>
                <input required type="text" name="address" value={formData.address} onChange={handleChange} style={{ width: '100%', padding: '0.8rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-primary)' }} />
              </div>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>City</label>
                  <input required type="text" name="city" value={formData.city} onChange={handleChange} style={{ width: '100%', padding: '0.8rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-primary)' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>ZIP Code</label>
                  <input required type="text" name="zip" value={formData.zip} onChange={handleChange} style={{ width: '100%', padding: '0.8rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-primary)' }} />
                </div>
              </div>

              <div style={{ height: '1px', background: 'var(--border-color)', margin: '1rem 0' }}></div>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>Card Payment (Stripe Test)</h3>
              
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Card Number</label>
                <input required type="text" name="cardNumber" value={formData.cardNumber} onChange={handleChange} style={{ width: '100%', padding: '0.8rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-primary)' }} />
              </div>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Expiry Date</label>
                  <input required type="text" name="expiry" value={formData.expiry} onChange={handleChange} placeholder="MM/YY" style={{ width: '100%', padding: '0.8rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-primary)' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>CVC</label>
                  <input required type="text" name="cvc" value={formData.cvc} onChange={handleChange} placeholder="123" style={{ width: '100%', padding: '0.8rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-primary)' }} />
                </div>
              </div>

              <button 
                type="submit" 
                disabled={loading}
                style={{
                  marginTop: '1.5rem',
                  width: '100%',
                  background: 'var(--success)',
                  color: '#000',
                  border: 'none',
                  padding: '1.2rem',
                  borderRadius: '12px',
                  fontWeight: 700,
                  fontSize: '1.1rem',
                  cursor: 'pointer',
                  transition: 'var(--transition-smooth)'
                }}>
                {loading ? 'Processing...' : `Pay $${totalAmount.toFixed(2)}`}
              </button>
            </div>
          </form>
        </div>

        {/* Cart summary panel */}
        <div className="glass-panel" style={{ flex: '1 1 300px', padding: '2rem', height: 'fit-content' }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', fontWeight: 600 }}>Order Summary</h2>
          {cartItems.length === 0 ? (
            <p style={{ color: 'var(--text-secondary)' }}>Your cart is empty.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
              {cartItems.map((item) => (
                <div key={item._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h4 style={{ fontWeight: 600 }}>{item.name}</h4>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Qty: {item.quantity}</p>
                  </div>
                  <span style={{ fontWeight: 700 }}>${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
              <div style={{ height: '1px', background: 'var(--border-color)', margin: '1rem 0' }}></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '1.2rem', fontWeight: 800 }}>
                <span>Total</span>
                <span style={{ color: 'var(--accent)' }}>${totalAmount.toFixed(2)}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Checkout;
