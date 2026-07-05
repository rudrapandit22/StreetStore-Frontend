import axios from "axios"

const cartapiinstance = axios.create({
    baseURL:"/api/cart",
    withCredentials:true
})

export const addItem=async (productId,variantId,quantity)=>{
    const response = await cartapiinstance.post(`/add/${productId}/${variantId}`,{quantity})
    return response.data
}

export const getCart = async()=>{
    const response = await cartapiinstance.get("/",{withCredentials:true})
    return response.data 
}

export const updateCartItemQuantity = async (productId, variantId, quantity) => {
    const response = await cartapiinstance.put(`/update/${productId}/${variantId}`, { quantity })
    return response.data
}

export const removeCartItem = async (productId, variantId) => {
    const response = await cartapiinstance.delete(`/remove/${productId}/${variantId}`)
    return response.data
}

export const checkoutCart = async () => {
    const response = await cartapiinstance.post("/checkout")
    return response.data
}