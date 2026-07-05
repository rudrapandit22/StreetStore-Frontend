import { addItem, getCart, updateCartItemQuantity, removeCartItem, checkoutCart } from "../service/cart.api.js"
import { useDispatch } from "react-redux"
import { setItems } from "../state/card.sliice.js"

export const useCart = () => {
    const dispatch = useDispatch();
    async function handleAdditem (productId, variantId, quantity){
        const data = await addItem(productId, variantId, quantity)
        return data 
    }
    async function handleCart (){
        const data = await getCart()
        const items = data.cart?.items || [];
        dispatch(setItems(items))
        return data 
    }
    async function handleUpdateQuantity (productId, variantId, quantity){
        const data = await updateCartItemQuantity(productId, variantId, quantity)
        const items = data.cart?.items || [];
        dispatch(setItems(items))
        return data
    }
    async function handleRemoveItem (productId, variantId){
        const data = await removeCartItem(productId, variantId)
        const items = data.cart?.items || [];
        dispatch(setItems(items))
        return data
    }
    async function handleCheckout (){
        const data = await checkoutCart()
        dispatch(setItems([]))
        return data
    }
    return { handleAdditem, handleCart, handleUpdateQuantity, handleRemoveItem, handleCheckout }
}
