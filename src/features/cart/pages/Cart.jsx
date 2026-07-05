import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useCart } from "../hook/useCart";
import { Link } from "react-router";
import { useRazorpay, RazorpayOrderOptions } from "react-razorpay";

const CURRENCY_SYMBOLS = { INR: '₹', USD: '$', EUR: '€', GBP: '£', AED: 'د.إ', JPY: '¥' };

const Cart = () => {
    const cartItems = useSelector(state => state.cart.items);
    const { handleCart, handleUpdateQuantity, handleRemoveItem, handleCheckout } = useCart();
    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState(null);
    const { error, isLoading, Razorpay } = useRazorpay();


    const showToast = (message, type = "info") => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    useEffect(() => {
        const fetchCart = async () => {
            try {
                await handleCart();
            } catch (err) {
                console.error("Failed to fetch cart:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchCart();
    }, []);

    const handlePayment = async () => {
        showToast("Processing order...", "info");
        try {
            await handleCheckout();
            showToast("Order placed successfully", "success");
        } catch (err) {
            showToast(err.response?.data?.message || err.message || "Failed to place order", "error");
        }
    };


    const handleQtyChange = async (item, delta) => {
        const nextQty = item.quantity + delta;
        if (nextQty < 1) return;
        try {
            await handleUpdateQuantity(item.product._id, item.variant, nextQty);
            showToast("Quantity updated", "success");
        } catch (err) {
            showToast(err.response?.data?.message || err.message || "Failed to update quantity", "error");
        }
    };

    const handleRemove = async (item) => {
        try {
            await handleRemoveItem(item.product._id, item.variant);
            showToast("Item removed from bag", "success");
        } catch (err) {
            showToast(err.response?.data?.message || err.message || "Failed to remove item", "error");
        }
    };

    // Helper to parse variant attributes
    const getVariantLabel = (product, variantId) => {
        if (!product || !product.variants) return "";
        const match = product.variants.find(v => v._id === variantId || v._id?.toString() === variantId?.toString());
        if (!match || !match.attributes) return "";

        const raw = match.attributes;
        let parsed = {};
        if (typeof raw.toJSON === 'function') parsed = raw.toJSON();
        else if (raw instanceof Map) parsed = Object.fromEntries(raw.entries());
        else parsed = raw;

        return Object.entries(parsed)
            .map(([k, val]) => `${k}: ${val}`)
            .join("  |  ");
    };

    // Helper to get image url (variant image or product fallback)
    const getItemImage = (product, variantId) => {
        if (!product) return "https://placehold.co/600x800?text=No+Image";
        const match = product.variants?.find(v => v._id === variantId || v._id?.toString() === variantId?.toString());
        if (match && match.images?.length > 0) {
            return match.images[0].url;
        }
        return product.images?.[0]?.url || "https://placehold.co/600x800?text=No+Image";
    };

    const subtotal = cartItems?.reduce((acc, item) => {
        const price = item.price?.amount || item.product?.price?.amount || 0;
        return acc + (price * item.quantity);
    }, 0) || 0;

    const currency = cartItems?.[0]?.price?.currency || cartItems?.[0]?.product?.price?.currency || "INR";
    const currencySymbol = CURRENCY_SYMBOLS[currency] || "₹";

    return (
        <div className="min-h-screen bg-[#FAF9F5] font-sans pb-24">
            {/* Premium Navbar */}
            <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-[#EBE7DF] px-6 py-4 flex items-center justify-between">
                <Link to="/" className="text-xl font-extrabold tracking-widest uppercase font-serif text-[#1C1917]">
                    STREETSTORE
                </Link>
                <Link to="/" className="text-xs uppercase tracking-wider font-bold text-[#6B5A47] hover:text-[#1C1917] transition-colors">
                    Continue Shopping
                </Link>
            </nav>

            <div className="max-w-5xl mx-auto px-6 mt-10">
                <div className="flex items-center justify-between border-b border-[#EBE7DF] pb-4 mb-8">
                    <h1 className="text-2xl font-bold font-serif text-[#1C1917] tracking-wide uppercase">Shopping Bag</h1>
                    <span className="text-xs text-[#8C7A65] font-bold uppercase tracking-wider bg-[#F5F1E9] border border-[#E2D8C6] px-3 py-1 rounded-full">
                        {cartItems?.length || 0} {cartItems?.length === 1 ? "Item" : "Items"}
                    </span>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-32">
                        <svg className="animate-spin h-8 w-8 text-[#6B5A47]" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                    </div>
                ) : !cartItems || cartItems.length === 0 ? (
                    <div className="text-center py-20 bg-white border border-[#EBE7DF] rounded-3xl p-8 max-w-md mx-auto shadow-sm">
                        <div className="w-16 h-16 bg-[#FAF9F5] border border-[#E2D8C6] rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-sm">
                            <svg className="w-8 h-8 text-[#8C7A65]" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                            </svg>
                        </div>
                        <h2 className="text-[#1C1917] text-lg font-bold font-serif uppercase tracking-wider mb-2">Your Bag is Empty</h2>
                        <p className="text-[#6B5A47] text-xs mb-8">Items you add to your shopping bag will show up here.</p>
                        <Link to="/" className="inline-block bg-[#1C1917] hover:bg-[#2C2927] text-white text-xs font-bold uppercase tracking-widest px-8 py-3.5 rounded-xl transition-all shadow-md active:scale-95">
                            Explore Streetwear
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
                        {/* Left Column: Items */}
                        <div className="lg:col-span-2 space-y-4">
                            {cartItems.map((item, idx) => {
                                const prod = item.product;
                                if (!prod) return null;
                                const price = item.price?.amount || prod.price?.amount || 0;
                                const itemImg = getItemImage(prod, item.variant);
                                const variantLabel = getVariantLabel(prod, item.variant);

                                const variantDetail = prod.variants?.find(v => v._id === item.variant || v._id?.toString() === item.variant?.toString());
                                const displayPrice = prod.price || { amount: 0, currency: "INR" };
                                const variantPrice = variantDetail?.price;
                                const stockValue = variantDetail?.stock;

                                return (
                                    <div key={item._id || idx} className="bg-white border border-[#EBE7DF] rounded-2xl p-4 flex gap-4 shadow-sm hover:shadow-md transition-shadow">
                                        <div className="w-20 aspect-[3/4] rounded-xl overflow-hidden bg-white border border-[#EBE7DF] flex-shrink-0">
                                            <img src={itemImg} alt={prod.title} className="w-full h-full object-cover" />
                                        </div>
                                        <div className="flex flex-col justify-between flex-1 py-0.5">
                                            <div>
                                                <div className="flex items-start justify-between gap-2 flex-wrap">
                                                    <div>
                                                        <h3 className="text-[#1C1917] font-bold text-sm tracking-wide line-clamp-1">
                                                            {prod.title}
                                                        </h3>
                                                        <div className="flex flex-col gap-0.5 mt-1">
                                                            <p className="text-[10px] text-[#8C7A65] font-semibold uppercase tracking-wider">
                                                                {stockValue !== undefined && stockValue !== null ? `Stock: ${stockValue}` : "Out of Stock"}
                                                            </p>
                                                            {variantPrice && variantPrice.amount !== undefined && displayPrice.amount > variantPrice.amount && (
                                                                <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider">
                                                                    you save {currencySymbol}{(displayPrice.amount - variantPrice.amount).toLocaleString()}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <span className="text-[#1C1917] font-extrabold text-sm whitespace-nowrap">
                                                        {currencySymbol}{price.toLocaleString()}
                                                    </span>
                                                </div>
                                                {variantLabel && (
                                                    <p className="text-[#8C7A65] text-[10px] font-bold uppercase tracking-wider mt-1.5 bg-[#FAF9F5] border border-[#EBE7DF] px-2 py-0.5 rounded-md inline-block">
                                                        {variantLabel}
                                                    </p>
                                                )}
                                            </div>
                                            <div className="flex items-center justify-between mt-4">
                                                <div className="flex items-center border border-[#EBE7DF] rounded-xl bg-[#FAF9F5] p-0.5 overflow-hidden">
                                                    <button
                                                        onClick={() => handleQtyChange(item, -1)}
                                                        disabled={item.quantity <= 1}
                                                        className="w-6 h-6 flex items-center justify-center text-xs font-bold text-[#6B5A47] hover:bg-[#EBE7DF]/30 rounded-lg disabled:opacity-40 transition-colors"
                                                    >
                                                        -
                                                    </button>
                                                    <span className="text-[10px] uppercase font-bold text-[#6B5A47] px-2.5">
                                                        {item.quantity}
                                                    </span>
                                                    <button
                                                        onClick={() => handleQtyChange(item, 1)}
                                                        className="w-6 h-6 flex items-center justify-center text-xs font-bold text-[#6B5A47] hover:bg-[#EBE7DF]/30 rounded-lg transition-colors"
                                                    >
                                                        +
                                                    </button>
                                                </div>
                                                <button
                                                    onClick={() => handleRemove(item)}
                                                    className="text-xs text-[#B5ADA2] hover:text-[#910F0F] transition-colors font-bold uppercase tracking-wider"
                                                >
                                                    Remove
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Right Column: Order Summary */}
                        <div className="bg-white border border-[#EBE7DF] rounded-3xl p-6 shadow-sm space-y-6">
                            <h3 className="text-[#1C1917] font-bold font-serif uppercase tracking-widest text-sm border-b border-[#EBE7DF] pb-3">
                                Order Summary
                            </h3>
                            <div className="space-y-3.5 text-xs text-[#6B5A47] font-medium">
                                <div className="flex justify-between">
                                    <span>Subtotal</span>
                                    <span className="text-[#1C1917] font-bold">{currencySymbol}{subtotal.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Shipping</span>
                                    <span className="text-[#8C7A65] font-bold uppercase tracking-wider">FREE</span>
                                </div>
                                <div className="border-t border-[#EBE7DF] pt-3.5 flex justify-between text-sm font-bold text-[#1C1917]">
                                    <span className="font-serif uppercase tracking-wider">Total</span>
                                    <span className="text-lg font-extrabold">{currencySymbol}{subtotal.toLocaleString()}</span>
                                </div>
                            </div>

                            <button onClick={handlePayment} className="w-full bg-[#1C1917] hover:bg-[#2C2927] text-white text-xs font-bold uppercase tracking-widest py-4 px-6 rounded-xl transition-all shadow-md active:scale-[0.98] mt-2">
                                Proceed to Checkout
                            </button>
                            <p className="text-[9px] text-[#B5ADA2] text-center uppercase tracking-wider font-semibold">
                                Secure checkout • simple returns
                            </p>
                        </div>
                    </div>
                )}
            </div>

            {toast && (
                <div className={`fixed bottom-5 right-5 z-50 flex items-center gap-3 px-4 py-3 rounded-xl border backdrop-blur-md shadow-lg transition-all duration-300 animate-slide-in
          ${toast.type === 'error'
                        ? 'bg-red-500/10 border-red-500/20 text-red-600'
                        : toast.type === 'success'
                            ? 'bg-[#1C1917] border-[#1C1917] text-white'
                            : 'bg-[#1C1917]/10 border-[#1C1917]/20 text-[#1C1917]'
                    }`}
                >
                    {toast.type === 'error' ? (
                        <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    ) : (
                        <svg className="w-4 h-4 text-[#C5BEB2]" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    )}
                    <span className="text-[10px] uppercase font-bold tracking-widest">{toast.message}</span>
                </div>
            )}
        </div>
    );
};

export default Cart;