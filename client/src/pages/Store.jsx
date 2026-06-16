import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProducts } from '../store/productSlice';
import { addToCart } from '../store/cartSlice';
import CartDrawer from '../components/cart/CartDrawer';
import { useState } from 'react';

function Store() {
  const dispatch = useDispatch();
  const { items: products, status } = useSelector((state) => state.products);
  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);

  const handleAddToCart = (product) => {
    dispatch(addToCart(product));
    setIsCartOpen(true); // Open drawer automatically
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 800 }}>Galaxy Store</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Configure and purchase your next-generation device.</p>
        </div>
        <button 
          onClick={() => setIsCartOpen(true)}
          style={{
            background: 'transparent',
            color: 'var(--text-primary)',
            border: '1px solid var(--border-color)',
            padding: '0.8rem 1.5rem',
            borderRadius: '12px',
            cursor: 'pointer',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            transition: 'var(--transition-smooth)'
          }}
          onMouseOver={(e) => e.target.style.borderColor = 'var(--primary)'}
          onMouseOut={(e) => e.target.style.borderColor = 'var(--border-color)'}>
          Cart View
        </button>
      </div>

      {status === 'loading' && (
        <div style={{ textAlign: 'center', margin: '4rem 0' }}>
          <div style={{ fontSize: '1.2rem', color: 'var(--text-secondary)' }}>Loading catalog...</div>
        </div>
      )}

      {status === 'failed' && (
        <div style={{ textAlign: 'center', margin: '4rem 0' }}>
          <div style={{ fontSize: '1.2rem', color: 'var(--error)' }}>Failed to load products. Using dummy catalog.</div>
        </div>
      )}

      {/* Grid of products */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
        gap: '2rem'
      }}>
        {products.map((product) => (
          <div 
            key={product._id} 
            className="glass-panel" 
            style={{
              padding: '1.5rem',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              height: '100%',
              borderRadius: '20px'
            }}>
            <div>
              <div style={{
                height: '240px',
                width: '100%',
                background: 'linear-gradient(135deg, rgba(45, 98, 255, 0.1) 0%, rgba(0, 240, 255, 0.05) 100%)',
                borderRadius: '12px',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                marginBottom: '1.5rem',
                border: '1px solid rgba(255, 255, 255, 0.03)'
              }}>
                <span style={{ fontSize: '4rem', opacity: 0.8 }}>📱</span>
              </div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>{product.name}</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem', height: '40px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {product.description}
              </p>
            </div>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <span style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--accent)' }}>
                  ${product.price}
                </span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  In Stock
                </span>
              </div>
              <button 
                onClick={() => handleAddToCart(product)}
                style={{
                  width: '100%',
                  background: 'var(--primary)',
                  color: 'var(--text-primary)',
                  border: 'none',
                  padding: '1rem',
                  borderRadius: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'var(--transition-smooth)'
                }}
                onMouseOver={(e) => e.target.style.boxShadow = '0 0 15px var(--primary-glow)'}
                onMouseOut={(e) => e.target.style.boxShadow = 'none'}>
                Add to Cart
              </button>
            </div>
          </div>
        ))}
      </div>

      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </div>
  );
}

export default Store;
