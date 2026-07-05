import {createproduct,getsellerproduct,getallproducts,getproductbyid,addproductvariant,updateVariantStockApi,deleteproductapi} from "../services/product.api"
import {useDispatch} from "react-redux"
import { setsellerproducts,setproducts,updateproductinstate,removeproductinstate } from "../state/product.slice"


export const useproduct = ()=>{

    const dispatch = useDispatch()

    async function handlecreateproduct(formdata){
        const data = await createproduct(formdata)
        return data.product
    }

    async function handlegetsellerproduct(){
        const data = await getsellerproduct()
        dispatch(setsellerproducts(data.products))
        return data.products
    }

    async function handlegetallproducts(){
        const data = await getallproducts()

        dispatch(setproducts(data.products))

    }

    async function handlegetproductbyid(productId){
        const data = await getproductbyid(productId)
        return data.product
    }

    async function handledeleteproduct(productId){
        await deleteproductapi(productId)
        dispatch(removeproductinstate(productId))
    }

    async function handleaddvariant(productId, variantData){
        const data = await addproductvariant(productId, variantData)
        dispatch(updateproductinstate(data.product))
        return data.product
    }

    async function handleupdatevariantstock(productId, variantId, stock){
        const data = await updateVariantStockApi(productId, variantId, stock)
        dispatch(updateproductinstate(data.product))
        return data.product
    }

    return {handlecreateproduct,handlegetsellerproduct,handlegetallproducts,handlegetproductbyid,handledeleteproduct,handleaddvariant,handleupdatevariantstock};
}