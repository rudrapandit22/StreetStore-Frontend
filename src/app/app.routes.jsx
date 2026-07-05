import { createBrowserRouter, Outlet } from "react-router"
import Register from "../features/auth/pages/Register"
import Login from "../features/auth/pages/Login"
import CreateProduct from "../features/products/pages/createproduct"
import Dashboard from "../features/products/pages/Dashboard"
import Protected from "../features/auth/components/Protected"
import Home from "../features/products/pages/Home"
import ProductDetails from "../features/products/pages/ProductDetails"
import SellerProductDetails from "../features/products/pages/SellerProductDetails"
import Cart from "../features/cart/pages/Cart"
export const routes = createBrowserRouter([
    {
        path: "/",
        element: <Home />,
    },
    {
        path: "/product/:productId",
        element: <ProductDetails />,
    },
    {
        path: "/register",
        element: <Register />
    },
    {
        path: "/login",
        element: <Login />
    },
    {
        path: "/cart",
        element: <Protected><Cart /></Protected>
    },
    {
        path: "/seller",
        element: <Outlet />,
        children: [
            {
                path: "/seller/create-product",
                element: <Protected requiredRole="seller"><CreateProduct /></Protected>
            },
            {
                path: "/seller/dashboard",
                element: <Protected requiredRole="seller"><Dashboard /></Protected>
            },
            {
                path:"/seller/product/:productId",
                element:<Protected requiredRole="seller"><SellerProductDetails /></Protected>
            }
        ]
    }
])

