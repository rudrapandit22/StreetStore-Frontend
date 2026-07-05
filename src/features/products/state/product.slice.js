import { createSlice } from "@reduxjs/toolkit";

const productslice = createSlice({
    name: "product",
    initialState: {
        sellerproducts: [],
        products: []
    },
    reducers: {
        setsellerproducts: (state, action) => {
            state.sellerproducts = action.payload;
        },
        setproducts: (state, action) => {
            state.products = action.payload;
        },
        updateproductinstate: (state, action) => {
            const updatedProduct = action.payload;
            state.sellerproducts = state.sellerproducts.map(p => p._id === updatedProduct._id ? updatedProduct : p);
            state.products = state.products.map(p => p._id === updatedProduct._id ? updatedProduct : p);
        },
        removeproductinstate: (state, action) => {
            const productId = action.payload;
            state.sellerproducts = state.sellerproducts.filter(p => p._id !== productId);
            state.products = state.products.filter(p => p._id !== productId);
        }
    }
})

export const { setsellerproducts, setproducts, updateproductinstate, removeproductinstate } = productslice.actions

export default productslice.reducer