import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

export const fetchProducts = createAsyncThunk(
  'products/fetchProducts',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_URL}/products`);
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch products');
      }
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  products: [],
  selectedProductId: null,
  isLoading: false,
  error: null,
}

const productSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    selectProduct(state, action) {
      state.selectedProductId = action.payload
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.products = action.payload.map(p => ({
          id: p._id,
          name: p.name,
          price: p.price,
          basePrice: p.price || p.basePrice,
          description: p.description,
          category: p.category,
          rating: p.rating || 5,
          variants: p.variants || [],
          colors: (p.variants || []).map(v => ({ name: v.colorName, hex: v.colorHex })),
          storages: p.storages || [],
          specs: p.specs || {},
          createdAt: p.createdAt
        }));
        if (state.products.length > 0 && !state.selectedProductId) {
          state.selectedProductId = state.products[0].id;
        }
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Something went wrong';
      });
  }
})

export const { selectProduct } = productSlice.actions
export default productSlice.reducer
