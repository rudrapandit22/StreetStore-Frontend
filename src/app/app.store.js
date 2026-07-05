import {configureStore} from "@reduxjs/toolkit" 
import authReducer from "../features/auth/state/auth.slice.js"
import productreducer from "../features/products/state/product.slice.js"
import cartreducer from "../features/cart/state/card.sliice.js"

export const store = configureStore({
    reducer:{
        auth:authReducer,
        product:productreducer,
        cart:cartreducer
    }
})