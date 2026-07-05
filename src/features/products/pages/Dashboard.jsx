import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useproduct } from '../hooks/useproducts';
import { Link, Navigate } from 'react-router';

// ── Currency symbol map ─────────────────────────────────────────────────────
const CURRENCY_SYMBOLS = { INR: '₹', USD: '$', EUR: '€', GBP: '£', AED: 'د.إ', SGD: 'S$', JPY: '¥' };

// ── Skeleton card ───────────────────────────────────────────────────────────
const SkeletonCard = () => (
  <div className="bg-white border border-[#EBE7DF] rounded-2xl overflow-hidden animate-pulse">
    <div className="aspect-[4/3] bg-[#EDE9E1]" />
    <div className="p-4 space-y-3">
      <div className="h-3 bg-[#EDE9E1] rounded-full w-3/4" />
      <div className="h-3 bg-[#EDE9E1] rounded-full w-1/2" />
      <div className="h-3 bg-[#EDE9E1] rounded-full w-1/3" />
    </div>
  </div>
);

// ── Empty state ─────────────────────────────────────────────────────────────
const EmptyState = () => (
  <div className="col-span-full flex flex-col items-center justify-center py-24 gap-5">
    <div className="w-16 h-16 rounded-2xl bg-[#F5F1E9] border border-[#E2D8C6] flex items-center justify-center">
      <svg className="w-7 h-7 text-[#B5ADA2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"
          d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10" />
      </svg>
    </div>
    <div className="text-center">
      <p className="text-[#1C1A17] font-semibold text-sm">No products yet</p>
      <p className="text-[#9C9188] text-xs mt-1">List your first product to get started</p>
    </div>
    <Link
      to="/seller/create-product"
      className="bg-[#1C1917] hover:bg-[#2C2927] text-white text-xs font-semibold px-5 py-2.5 rounded-xl transition-all duration-200 active:scale-[0.98]"
    >
      + List a Product
    </Link>
  </div>
);

// ── Product card ─────────────────────────────────────────────────────────────
const ProductCard = ({ product, onUnlistTrigger }) => {
  const [imgIdx, setImgIdx] = useState(0);
  const symbol = CURRENCY_SYMBOLS[product.price?.currency] ?? product.price?.currency;
  const hasMultiple = product.images?.length > 1;

  const handleUnlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onUnlistTrigger(product._id);
  };

  return (
    <Link to={`/seller/product/${product._id}`} className="group bg-white border border-[#EBE7DF] rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-[0_8px_32px_rgb(180,170,155,0.18)] hover:-translate-y-0.5 block">
      {/* Image area */}
      <div className="relative aspect-[4/3] bg-[#F5F2ED] overflow-hidden">
        {product.images?.length > 0 ? (
          <img
            src={product.images[imgIdx].url}
            alt={product.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <svg className="w-10 h-10 text-[#C5BEB2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}

        {/* Image count badge */}
        {product.images?.length > 1 && (
          <span className="absolute top-2.5 right-2.5 bg-[#1C1917]/75 text-white text-[10px] font-bold px-2 py-0.5 rounded-full backdrop-blur-sm tracking-wide">
            {product.images.length} photos
          </span>
        )}

        {/* Dot nav for multiple images */}
        {hasMultiple && (
          <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 flex gap-1">
            {product.images.map((_, i) => (
              <button
                key={i}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setImgIdx(i);
                }}
                className={`w-1.5 h-1.5 rounded-full transition-all duration-200 ${i === imgIdx ? 'bg-white scale-125' : 'bg-white/50'
                  }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 space-y-2.5 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-[#1C1A17] font-semibold text-sm leading-snug line-clamp-1 flex-1">
              {product.title}
            </h3>
            <span className="text-[#1C1A17] font-bold text-sm whitespace-nowrap">
              {symbol}{product.price?.amount?.toLocaleString()}
            </span>
          </div>

          <p className="text-[#9C9188] text-xs leading-relaxed line-clamp-2 mt-1">
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
              <div className="mt-2.5 pt-2 border-t border-[#F5F2ED] space-y-1.5">
                {sizesArr.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1">
                    <span className="text-[9px] font-bold uppercase tracking-wider text-[#8C7A65]">Sizes:</span>
                    <div className="flex flex-wrap gap-1">
                      {sizesArr.map(s => (
                        <span key={s} className="text-[9px] px-1.5 py-0.5 bg-[#FAF9F5] border border-[#EBE7DF] rounded-md text-[#6B5A47] font-semibold">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {colorsArr.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1">
                    <span className="text-[9px] font-bold uppercase tracking-wider text-[#8C7A65]">Colors:</span>
                    <div className="flex flex-wrap gap-1">
                      {colorsArr.map(c => (
                        <span key={c} className="text-[9px] px-1.5 py-0.5 bg-[#FAF9F5] border border-[#EBE7DF] rounded-md text-[#6B5A47] font-semibold">
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

        <div className="flex items-center justify-between pt-3 mt-3 border-t border-[#F5F2ED]">
          <div className="flex items-center gap-2">
            <span className="text-[#B5ADA2] text-[10px] font-semibold uppercase tracking-widest">
              {product.price?.currency}
            </span>
            <span className="text-[#B5ADA2] text-[10px]">•</span>
            <span className="text-[#B5ADA2] text-[10px]">
              {new Date(product.createdAt).toLocaleDateString('en-IN', {
                day: 'numeric', month: 'short', year: 'numeric'
              })}
            </span>
          </div>
          <button
            onClick={handleUnlist}
            className="text-[10px] font-bold text-red-500 hover:text-red-700 uppercase tracking-wider bg-red-50 hover:bg-red-100 border border-red-100 rounded-md px-2 py-1 transition-all select-none"
          >
            Unlist
          </button>
        </div>
      </div>
    </Link>
  );
};

// ── Dashboard ────────────────────────────────────────────────────────────────
const Dashboard = () => {
  const { handlegetsellerproduct, handledeleteproduct } = useproduct();
  const products = useSelector((state) => state.product.sellerproducts);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState(null);
  const [confirmUnlist, setConfirmUnlist] = useState(null); // productId

  const showToast = (message, type = "info") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleExecuteUnlist = async (productId) => {
    try {
      await handledeleteproduct(productId);
      showToast("Product unlisted successfully", "success");
    } catch (err) {
      showToast(err.response?.data?.message || err.message || "Failed to unlist product", "error");
    }
  };

  useEffect(() => {
    (async () => {
      try {
        await handlegetsellerproduct();
      } catch (err) {
        setError(err?.message || 'Failed to load products.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const totalRevenue = products.reduce((sum, p) => sum + (p.price?.amount ?? 0), 0);

  return (
    <div className="relative min-h-screen w-full bg-[#FAF9F5] font-sans overflow-hidden">
      {/* Ambient blobs */}
      <div className="absolute top-[-6%] left-[-6%] w-[400px] h-[400px] rounded-full bg-[#EAE3D2]/35 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-6%] right-[-6%] w-[400px] h-[400px] rounded-full bg-[#E3D9C6]/30 blur-[120px] pointer-events-none" />

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-10">

        {/* ── Top bar ─────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-10">
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 bg-[#F5F1E9] border border-[#E2D8C6] rounded-2xl flex items-center justify-center shadow-sm flex-shrink-0">
              <svg className="w-5 h-5 text-[#6B5A47]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            </div>
            <div>
              <h1 className="text-[#1A1817] text-xl font-extrabold tracking-widest uppercase font-serif">
                Seller Hub
              </h1>
              <p className="text-[#9C9188] text-[10px] uppercase tracking-widest font-semibold mt-0.5">
                StreetStore · Your Listings
              </p>
            </div>
          </div>

          <Link
            to="/seller/create-product"
            id="list-new-product-btn"
            className="inline-flex items-center gap-2 bg-[#1C1917] hover:bg-[#2C2927] text-white text-xs font-semibold px-5 py-3 rounded-xl transition-all duration-200 active:scale-[0.98] shadow-md self-start sm:self-auto"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
            </svg>
            List a Product
          </Link>
        </div>

        {/* ── Stats strip ─────────────────────────────────── */}
        {!loading && !error && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-10">
            {[
              {
                label: 'Total Listings',
                value: products.length,
                icon: (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                    d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10" />
                )
              },
              {
                label: 'Total Images',
                value: products.reduce((s, p) => s + (p.images?.length ?? 0), 0),
                icon: (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                )
              },
              {
                label: 'Catalogue Value',
                value: `₹${totalRevenue.toLocaleString()}`,
                icon: (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                )
              }
            ].map((stat) => (
              <div
                key={stat.label}
                className="bg-white border border-[#EBE7DF] rounded-2xl px-5 py-4 flex items-center gap-4 shadow-[0_2px_12px_rgb(220,215,205,0.15)]"
              >
                <div className="w-9 h-9 rounded-xl bg-[#F5F1E9] border border-[#E2D8C6] flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-[#6B5A47]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {stat.icon}
                  </svg>
                </div>
                <div className="min-w-0">
                  <p className="text-[#1C1A17] font-bold text-lg leading-none">{stat.value}</p>
                  <p className="text-[#B5ADA2] text-[10px] uppercase tracking-wider font-semibold mt-1 truncate">
                    {stat.label}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Divider label ───────────────────────────────── */}
        {!loading && !error && products.length > 0 && (
          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1 h-px bg-[#E6E1D8]" />
            <span className="text-[#9C9188] text-[10px] font-bold uppercase tracking-widest">
              {products.length} listing{products.length !== 1 ? 's' : ''}
            </span>
            <div className="flex-1 h-px bg-[#E6E1D8]" />
          </div>
        )}

        {/* ── Error ───────────────────────────────────────── */}
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-start gap-3">
            <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        {/* ── Grid ────────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {loading
            ? Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)
            : products.length === 0
              ? <EmptyState />
              : products.map((product) => (
                <ProductCard key={product._id} product={product} onUnlistTrigger={setConfirmUnlist} />
              ))}
        </div>
      </div>

      {/* Confirmation Modal */}
      {confirmUnlist && (
        <div className="fixed inset-0 z-50 bg-[#1A1817]/40 backdrop-blur-[2px] flex items-center justify-center p-4">
          <div className="bg-white border border-[#EBE7DF] rounded-2xl p-6 max-w-sm w-full shadow-xl space-y-4 animate-scale-in">
            <h3 className="text-[#1A1817] font-bold font-serif uppercase tracking-widest text-xs border-b border-[#EBE7DF] pb-2">
              Unlist Product
            </h3>
            <p className="text-xs text-[#6B5A47] leading-relaxed">
              Are you sure you want to unlist this product? This action will remove it from the storefront catalog.
            </p>
            <div className="flex gap-2.5 justify-end pt-2">
              <button
                onClick={() => setConfirmUnlist(null)}
                className="bg-[#FAF9F5] border border-[#EBE7DF] text-[#6B5A47] hover:bg-[#F5F1E9] text-[10px] font-bold uppercase tracking-wider px-3.5 py-2 rounded-xl transition-all"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  handleExecuteUnlist(confirmUnlist);
                  setConfirmUnlist(null);
                }}
                className="bg-red-600 hover:bg-red-700 text-white text-[10px] font-bold uppercase tracking-wider px-3.5 py-2 rounded-xl transition-all shadow-md active:scale-95"
              >
                Unlist Product
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
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

export default Dashboard;
