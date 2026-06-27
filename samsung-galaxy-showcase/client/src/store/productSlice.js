import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  products: [
    {
      id: 's23-ultra',
      name: 'Samsung Galaxy S23 Ultra',
      basePrice: 1199.99,
      colors: [
        { name: 'Phantom Black', hex: '#1C1C1E', label: 'Black' },
        { name: 'Cream', hex: '#F5F5F0', label: 'Cream' },
        { name: 'Green', hex: '#2E3B33', label: 'Green' },
        { name: 'Lavender', hex: '#E6D7E8', label: 'Lavender' }
      ],
      storages: [
        { size: '256GB', priceModifier: 0 },
        { size: '512GB', priceModifier: 150.00 },
        { size: '1TB', priceModifier: 350.00 }
      ],
      specs: {
        camera: '200 MP Ultra-Resolution Sensor with Nightography',
        processor: 'Snapdragon® 8 Gen 2 Mobile Platform for Galaxy',
        display: '6.8" Dynamic AMOLED 2X, QHD+, 120Hz Refresh Rate',
        battery: '5000 mAh (typical) with 45W Super Fast Charging 2.0',
        spen: 'Integrated S Pen for seamless sketching, writing, and controls',
        material: 'Armor Aluminum Frame with Corning® Gorilla® Glass Victus® 2'
      },
      features: [
        {
          title: '200MP Main Camera',
          description: 'Capture stunningly clear photos even in low-light environments with advanced adaptive pixel technology.'
        },
        {
          title: 'Premium Gaming Power',
          description: 'Uncompromising speeds and performance with the customized Snapdragon 8 Gen 2 processor, featuring ray tracing.'
        },
        {
          title: 'Cinematic Display',
          description: 'A massive 6.8-inch screen with vision booster technology that adjusts color and contrast to match ambient lighting.'
        }
      ]
    }
  ],
  selectedProductId: 's23-ultra',
}

const productSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    selectProduct(state, action) {
      state.selectedProductId = action.payload
    }
  }
})

export const { selectProduct } = productSlice.actions
export default productSlice.reducer
