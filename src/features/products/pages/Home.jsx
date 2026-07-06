import React, { useEffect, useState } from 'react';
import { useproduct } from '../hooks/useproducts';
import { useSelector } from 'react-redux';
import { Link } from 'react-router';
import { useauth } from '../../auth/hook/useAuth.js';

const Home = () => {
  const { handlegetallproducts } = useproduct();
  const products = useSelector((state) => state.product.products);
  const { user, handlelogout } = useauth();
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = "info") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const onLogout = async () => {
    await handlelogout();
    showToast("Logged out successfully", "success");
  };

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        await handlegetallproducts();
      } catch (err) {
        console.error("Failed to fetch products:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  return (
    <div className="min-h-screen bg-[#FAF9F5] font-sans">
      {/* Premium Navbar */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-[#EBE7DF] px-6 py-4 flex items-center justify-between">
        <Link to="/" className="text-xl font-extrabold tracking-widest uppercase font-serif text-[#1C1917]">
          STREETSTORE
        </Link>
        <div className="flex items-center gap-6">
          {user ? (
            <>
              {user.role === 'seller' && (
                <Link to="/seller/dashboard" className="text-xs uppercase tracking-wider font-bold text-[#8C7A65] hover:text-[#1C1917] transition-colors">
                  Dashboard
                </Link>
              )}
              <span className="text-xs uppercase tracking-wider font-bold text-[#6B5A47]">
                Hi, {user.fullname.split(' ')[0]}
              </span>
            </>
          ) : (
            <Link to="/login" className="text-xs uppercase tracking-wider font-bold text-[#1C1917] hover:text-[#8C7A65] transition-colors">
              Login
            </Link>
          )}
          {/* Cart Icon */}
          <Link to="/cart" className="relative text-[#1C1917] hover:text-[#8C7A65] transition-colors p-1" aria-label="Cart">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            <span className="absolute top-0 right-0 w-2 h-2 bg-[#8C7A65] rounded-full"></span>
          </Link>
          {user && (
            <button
              onClick={onLogout}
              className="text-xs uppercase tracking-wider font-bold text-[#6B5A47] hover:text-[#1C1917] transition-colors cursor-pointer"
            >
              Logout
            </button>
          )}
        </div>
      </nav>

      {/* Hero section */}
      <div className="relative py-12 px-8 text-center bg-[#FAF9F5] overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-[#EAE3D2]/40 blur-[130px] pointer-events-none" />
        <h1 className="text-[#1C1917] text-3xl md:text-4xl font-extrabold tracking-tight uppercase font-serif mb-3">
          STREETWEAR EVOLVED
        </h1>
        <p className="text-[#6B5A47] text-[10px] uppercase tracking-widest font-bold max-w-md mx-auto leading-relaxed">
          Premium Fit. Minimalist Design. Seamless Shopping.
        </p>
      </div>

      {/* Main product feed */}
      <div className="max-w-7xl mx-auto px-4 pb-24">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <svg className="animate-spin h-8 w-8 text-[#6B5A47]" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-[#E6E1D8] rounded-3xl bg-white">
            <p className="text-[#6B5A47] font-semibold text-sm">No products found</p>
            <p className="text-[#B5ADA2] text-xs mt-1">Check back later for new arrivals.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {products.map((product) => {
              const coverImage = product.images?.[0]?.url || 'https://placehold.co/600x800?text=No+Image';
              return (
                <Link to={`/product/${product._id}`} key={product._id} className="group relative flex flex-col bg-white border border-[#EBE7DF] rounded-xl overflow-hidden hover:shadow-[0_8px_20px_rgb(230,225,215,0.25)] transition-all duration-300">
                  <div className="aspect-[3/4] bg-[#FAF8F5] overflow-hidden relative">
                    <img
                      src={coverImage}
                      alt={product.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-3.5 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="text-[#1C1917] font-semibold text-xs tracking-wide group-hover:text-[#8C7A65] transition-colors line-clamp-1">
                        {product.title}
                      </h3>
                      <p className="text-[#6B5A47] text-[11px] mt-1 line-clamp-2 leading-relaxed">
                        {product.description}
                      </p>

                      {/* Variant summary tags */}
                      {(() => {
                        if (!product.variants?.length) return null;
                        const sizes = new Set();
                        const colors = new Set();
                        product.variants.forEach(v => {
                          if (!v.attributes) return;
                          const raw = v.attributes;
                          let parsed = {};
                          if (typeof raw.toJSON === 'function') parsed = raw.toJSON();
                          else if (raw instanceof Map) parsed = Object.fromEntries(raw.entries());
                          else parsed = raw;

                          Object.entries(parsed).forEach(([k, val]) => {
                            const kLower = k.toLowerCase();
                            if (kLower.includes('size')) sizes.add(val);
                            if (kLower.includes('color') || kLower.includes('colour')) colors.add(val);
                          });
                        });

                        const sizesArr = Array.from(sizes);
                        const colorsArr = Array.from(colors);

                        if (sizesArr.length === 0 && colorsArr.length === 0) return null;

                        return (
                          <div className="mt-2.5 pt-2 border-t border-[#FAF8F5] space-y-1.5">
                            {sizesArr.length > 0 && (
                              <div className="flex flex-wrap items-center gap-1">
                                <span className="text-[8px] font-bold uppercase tracking-wider text-[#8C7A65]">Sizes:</span>
                                <div className="flex flex-wrap gap-1">
                                  {sizesArr.map(s => (
                                    <span key={s} className="text-[8px] px-1.5 py-0.5 bg-[#FAF9F5] border border-[#EBE7DF] rounded-md text-[#6B5A47] font-semibold">
                                      {s}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                            {colorsArr.length > 0 && (
                              <div className="flex flex-wrap items-center gap-1">
                                <span className="text-[8px] font-bold uppercase tracking-wider text-[#8C7A65]">Colors:</span>
                                <div className="flex flex-wrap gap-1">
                                  {colorsArr.map(c => (
                                    <span key={c} className="text-[8px] px-1.5 py-0.5 bg-[#FAF9F5] border border-[#EBE7DF] rounded-md text-[#6B5A47] font-semibold">
                                      {c}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })()}
                    </div>
                    <div className="mt-3 pt-3 border-t border-[#FAF8F5] flex items-center justify-between">
                      <span className="text-[#1C1917] font-extrabold text-xs tracking-wider">
                        {product.price?.currency || 'INR'} {product.price?.amount}
                      </span>
                      <span className="bg-[#1C1917] text-white text-[9px] uppercase font-bold tracking-widest px-2.5 py-1.5 rounded-md hover:bg-[#2C2927] transition-all">
                        View
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-xl border backdrop-blur-md animate-slide-up
          ${toast.type === 'error'
            ? 'bg-rose-50/95 border-rose-200/60 text-rose-800'
            : 'bg-emerald-50/95 border-emerald-200/60 text-emerald-800'
          }`}
        >
          <svg className="w-4 h-4 text-emerald-600 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-[10px] uppercase font-bold tracking-widest">{toast.message}</span>
        </div>
      )}
    </div>
  );
};

export default Home;
