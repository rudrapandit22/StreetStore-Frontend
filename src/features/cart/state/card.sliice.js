import { createSlice } from "@reduxjs/toolkit";

const cartslice =createSlice ({
    name:"cart",
    initialState:{
        items:[],
        
    },
    reducers:{
        setItems:(state,action)=>{
            state.items=action.payload;
        },
        addItemToState:(state,action)=>{
            state.items.push(action.payload)
        },
        removeItem:(state,action)=>{
            state.items=state.items.filter(item=>item._id !== action.payload._id)
        }
    }
})

export const {setItems,addItemToState,removeItem}= cartslice.actions;
export default cartslice.reducer;