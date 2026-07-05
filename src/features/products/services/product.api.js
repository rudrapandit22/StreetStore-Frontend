import axios from "axios"

const productapiinstance = axios.create({
    baseURL: "/api/products",
    withCredentials: true,
})

// Fetch ImageKit signed auth params from backend
export async function getImagekitAuth() {
    const response = await productapiinstance.get("/imagekit-auth")
    return response.data
}

// Create product — send JSON with imageUrls already uploaded to ImageKit
export async function createproduct(data) {
    const response = await productapiinstance.post("/", data, {
        headers: { "Content-Type": "application/json" }
    })
    return response.data
}

export async function getsellerproduct() {
    const response = await productapiinstance.get("/seller")
    return response.data
}

export async function getallproducts() {
    const response = await productapiinstance.get("/")
    return response.data
}

export async function getproductbyid(productId) {
    const response = await productapiinstance.get(`/${productId}`)
    return response.data
}

export async function deleteproductapi(productId) {
    const response = await productapiinstance.delete(`/${productId}`)
    return response.data
}

export async function addproductvariant(productId, newproductvariant) {
    const formData = new FormData()

    newproductvariant.images.forEach((image)=>{
        formData.append("image", image.file)
    })
    formData.append("stock",newproductvariant.stock)
    formData.append("price",newproductvariant.priceAmount || '')
    formData.append("mrp",newproductvariant.priceMrp || '')
    formData.append("currency",newproductvariant.priceCurrency || 'INR')
    formData.append("attributes", typeof newproductvariant.attributes === 'object' ? JSON.stringify(newproductvariant.attributes) : newproductvariant.attributes)
    
    const response = await productapiinstance.post(`/${productId}/variants`, formData)
    return response.data
}

export async function updateVariantStockApi(productId, variantId, stock) {
    const response = await productapiinstance.put(`/${productId}/variants/stock`, { variantId, stock })
    return response.data
}