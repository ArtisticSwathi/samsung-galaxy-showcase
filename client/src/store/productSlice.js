import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Mock products to fall back on if API call fails
const mockProducts = [
  {
    _id: 'prod1',
    name: 'Galaxy S26 Ultra',
    description: 'Titanium framework with integrated S Pen, Snapdragon 8 Gen 5, and 200MP camera system.',
    price: 1299.99,
    color: 'Titanium Gray',
    storage: '256GB'
  },
  {
    _id: 'prod2',
    name: 'Galaxy S26+',
    description: 'Dynamic AMOLED 2X, enhanced battery life, and powerful triple-camera layout.',
    price: 999.99,
    color: 'Onyx Black',
    storage: '256GB'
  },
  {
    _id: 'prod3',
    name: 'Galaxy S26',
    description: 'Compact premium performance. Exceptional speed and all-day intelligent battery.',
    price: 799.99,
    color: 'Marble Gray',
    storage: '128GB'
  }
];

export const fetchProducts = createAsyncThunk('products/fetchProducts', async () => {
  try {
    const response = await axios.get('/api/products');
    return response.data;
  } catch (error) {
    console.warn('API connection failed. Using mock product catalog.', error);
    return mockProducts; // Return local products as fallback
  }
});

const productSlice = createSlice({
  name: 'products',
  initialState: {
    items: mockProducts, // Seed default mock products directly
    status: 'idle',
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      });
  },
});

export default productSlice.reducer;
