import axios from "axios";

const authapiinstance = axios.create({
    baseURL:"/api/auth",
    withCredentials:true,
})

export async function register({email,contact,password,fullname,isSeller}){
    const response = await authapiinstance.post("/register",{
        email,contact,password,fullname,isSeller
    })
    return response.data
}

export async function login({email,password}){
    const response = await authapiinstance.post("/login",{
        email,password
    })
    return response.data
}

export async function getMe(){
    const response = await authapiinstance.get("/me")

    return response.data 
}

export async function getallproducts(){
    const response = await productapiinstance.get("/")
    return response.data
}