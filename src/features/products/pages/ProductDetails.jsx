import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router';
import { useproduct } from '../hooks/useproducts';
import { useCart } from '../../cart/hook/useCart';
import { useauth } from '../../auth/hook/useAuth.js';
const CURRENCY_SYMBOLS = { INR: '₹', USD: '$', EUR: '€', GBP: '£', AED: 'د.إ', JPY: '¥' };

const ProductDetails = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { handlegetproductbyid } = useproduct();
  const { user, handlelogout } = useauth();
  const {handleAdditem} = useCart();

  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedImage, setSelectedImage] = useState('');
  const [addingToCart, setAddingToCart] = useState(false);
  const [buyingNow, setBuyingNow] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [selectedAttributes, setSelectedAttributes] = useState({});

  // Helper to parse variant attributes into a plain JS object
  const getParsedAttributes = (variant) => {
    if (!variant || !variant.attributes) return {};
    const raw = variant.attributes;
    if (typeof raw.toJSON === 'function') return raw.toJSON();
    if (raw instanceof Map) return Object.fromEntries(raw.entries());
    if (Array.isArray(raw)) {
      const obj = {};
      raw.forEach(item => { obj[item.key] = item.value; });
      return obj;
    }
    return raw;
  };

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const prod = await handlegetproductbyid(productId);
        setProduct(prod);
        if (prod?.images?.length > 0) {
          setSelectedImage(prod.images[0].url);
        }
        if (prod?.variants?.length > 0) {
          const firstVar = prod.variants[0];
          setSelectedVariant(firstVar);
          if (firstVar.images?.length > 0) {
            setSelectedImage(firstVar.images[0].url);
          }
          
          const initialAttrs = {};
          const parsed = getParsedAttributes(firstVar);
          Object.entries(parsed).forEach(([k, v]) => {
            initialAttrs[k] = v;
          });
          setSelectedAttributes(initialAttrs);
        }
      } catch (err) {
        setError('Failed to load product details.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [productId]);

  const displayImages = [
    ...(selectedVariant?.images || []),
    ...(product?.images || [])
  ].filter((img, idx, self) => 
    self.findIndex(i => i.url === img.url) === idx
  );

  const handlePrevImage = () => {
    if (!displayImages.length) return;
    const currentIndex = displayImages.findIndex(img => img.url === selectedImage);
    const prevIndex = (currentIndex - 1 + displayImages.length) % displayImages.length;
    setSelectedImage(displayImages[prevIndex].url);
  };

  const handleNextImage = () => {
    if (!displayImages.length) return;
    const currentIndex = displayImages.findIndex(img => img.url === selectedImage);
    const nextIndex = (currentIndex + 1) % displayImages.length;
    setSelectedImage(displayImages[nextIndex].url);
  };

  const handleAction = async (actionType) => {
    if (!user) {
      alert("Please log in to continue.");
      navigate('/login');
      return;
    }

    const variantId = selectedVariant?._id || "";
    if (actionType === 'cart') {
      setAddingToCart(true);
      try {
        await handleAdditem(product._id, variantId, 1);
        alert(`${product.title} has been added to your cart.`);
      } catch (err) {
        alert(err.response?.data?.message || err.message || "Failed to add item to cart");
      } finally {
        setAddingToCart(false);
      }
    } else if (actionType === 'buy') {
      setBuyingNow(true);
      try {
        await handleAdditem(product._id, variantId, 1);
        navigate('/cart');
      } catch (err) {
        alert(err.response?.data?.message || err.message || "Failed to add item to cart");
        setBuyingNow(false);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF9F5] flex items-center justify-center">
        <svg className="animate-spin h-8 w-8 text-[#6B5A47]" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-[#FAF9F5] flex flex-col items-center justify-center p-6">
        <div className="text-center p-8 border border-[#E6E1D8] rounded-3xl bg-white max-w-md">
          <p className="text-red-600 font-semibold text-sm">{error || "Product not found"}</p>
          <Link to="/" className="mt-4 inline-block bg-[#1C1917] text-white text-xs uppercase font-bold tracking-widest px-4 py-2.5 rounded-lg hover:bg-[#2C2927] transition-all">
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF9F5] font-sans">
      {/* Premium Navbar */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-[#EBE7DF] px-6 py-4 flex items-center justify-between">
        <Link to="/" className="text-xl font-extrabold tracking-widest uppercase font-serif text-[#1C1917]">
          STREETSTORE
        </Link>
        <div className="flex items-center gap-6">
          <Link to="/" className="text-xs uppercase tracking-wider font-bold text-[#6B5A47] hover:text-[#1C1917] transition-colors">
            Shop
          </Link>
          {user ? (
            <span className="text-xs uppercase tracking-wider font-bold text-[#6B5A47]">
              Hi, {user.fullname.split(' ')[0]}
            </span>
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
              onClick={handlelogout}
              className="text-xs uppercase tracking-wider font-bold text-[#6B5A47] hover:text-[#1C1917] transition-colors cursor-pointer"
            >
              Logout
            </button>
          )}
        </div>
      </nav>

      {/* Main product view */}
      <div className="max-w-6xl mx-auto px-6 py-10">
        {/* Breadcrumb */}
        <div className="text-[10px] text-[#8C7A65] font-semibold uppercase tracking-wider mb-6 flex gap-1.5 items-center">
          <Link to="/" className="hover:text-[#1C1917] transition-colors">Home</Link>
          <span>/</span>
          <span>Clothing</span>
          <span>/</span>
          <span>{product.title}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 items-start">
          {/* Left Column: Images grid (Myntra style 2 columns of images) */}
          <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {displayImages.map((img, idx) => (
              <div key={idx} className="aspect-[3/4] bg-white border border-[#EBE7DF] rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                <img
                  src={img.url}
                  alt={`Product view ${idx + 1}`}
                  className="w-full h-full object-cover hover:scale-[1.02] transition-transform duration-500"
                />
              </div>
            ))}
            {displayImages.length === 0 && (
              <div className="aspect-[3/4] bg-white border border-[#EBE7DF] rounded-xl flex items-center justify-center text-neutral-400">
                No images available
              </div>
            )}
          </div>

          {/* Right Column: Sticky details panel */}
          <div className="lg:col-span-2 sticky top-24 space-y-6">
            <div>
              <h1 className="text-2xl font-extrabold text-[#1A1817] font-serif tracking-wide uppercase">
                STREETSTORE
              </h1>
              <h2 className="text-[#6B5A47] text-sm font-medium mt-1">
                {product.title}
              </h2>

              {/* Ratings */}
              <div className="flex items-center gap-2 mt-3.5">
                <div className="flex items-center gap-1 bg-[#FAF9F5] border border-[#EBE7DF] px-2 py-0.5 rounded-md text-[10px] font-extrabold text-neutral-800">
                  <span>4.3</span>
                  <span className="text-amber-500">★</span>
                </div>
                <span className="text-[10px] text-[#B5ADA2] font-semibold uppercase tracking-wider">
                  | 11.1k Ratings
                </span>
              </div>
            </div>

            <div className="border-t border-[#EBE7DF] pt-5">
              {/* Pricing */}
              {(() => {
                const basePrice = selectedVariant?.price?.amount ?? product.price?.amount ?? 0;
                const mrpPrice = selectedVariant?.price?.mrp ?? product.price?.mrp;
                const currencySymbol = CURRENCY_SYMBOLS[selectedVariant?.price?.currency || product.price?.currency] || "₹";

                const discountPercent = mrpPrice && mrpPrice > basePrice
                  ? Math.round(((mrpPrice - basePrice) / mrpPrice) * 100)
                  : 0;

                return (
                  <div className="space-y-1">
                    <div className="flex items-baseline gap-3">
                      <span className="text-2xl font-extrabold text-[#1A1817] tracking-wide">
                        {currencySymbol}{basePrice.toLocaleString()}
                      </span>
                      {mrpPrice && mrpPrice > basePrice && (
                        <>
                          <span className="text-xs text-[#B5ADA2] line-through font-medium">
                            MRP {currencySymbol}{mrpPrice.toLocaleString()}
                          </span>
                          <span className="text-xs text-orange-600 font-extrabold uppercase tracking-wide">
                            ({discountPercent}% OFF)
                          </span>
                        </>
                      )}
                    </div>
                    <p className="text-[10px] text-emerald-600 font-extrabold uppercase tracking-wider">
                      inclusive of all taxes
                    </p>
                  </div>
                );
              })()}
            </div>

            {user && product && (
              ((typeof product.seller === 'string' && product.seller === user._id) ||
               (product.seller?._id && product.seller._id === user._id) ||
               (product.seller === user._id))
            ) && (
              <div className="bg-[#FAF9F5] border border-[#EBE7DF] rounded-2xl p-4 flex items-center justify-between shadow-sm">
                <div className="text-xs text-[#6B5A47] font-semibold">
                  You listed this product.
                </div>
                <Link 
                  to={`/seller/product/${product._id}`}
                  className="bg-[#1A1817] hover:bg-neutral-800 text-white text-[10px] font-bold uppercase tracking-wider px-3.5 py-2 rounded-xl transition-all"
                >
                  Manage Variants &amp; Stock
                </Link>
              </div>
            )}

            {/* Variants Selector */}
            {product.variants?.length > 0 && (() => {
              const attributeKeys = Array.from(
                new Set(
                  product.variants.flatMap(v => Object.keys(getParsedAttributes(v)))
                )
              );

              const getValuesForAttribute = (key) => {
                const rawValues = product.variants.map(v => getParsedAttributes(v)[key]).filter(Boolean);
                if (key.toLowerCase().includes('size')) {
                  const splitValues = [];
                  rawValues.forEach(val => {
                    if (typeof val === 'string' && val.includes(',')) {
                      val.split(',').forEach(s => splitValues.push(s.trim()));
                    } else {
                      splitValues.push(String(val).trim());
                    }
                  });
                  return Array.from(new Set(splitValues));
                }
                return Array.from(new Set(rawValues));
              };

              const isOptionSelectable = (key, val) => {
                const testAttrs = { ...selectedAttributes, [key]: val };
                return product.variants.some(v => {
                  const vAttrs = getParsedAttributes(v);
                  return Object.entries(testAttrs).every(([k, vVal]) => {
                    const attrVal = vAttrs[k];
                    if (k.toLowerCase().includes('size') && typeof attrVal === 'string' && attrVal.includes(',')) {
                      return attrVal.split(',').map(s => s.trim()).includes(vVal);
                    }
                    return attrVal === vVal;
                  });
                });
              };

              const handleSelectAttribute = (key, value) => {
                const nextAttrs = { ...selectedAttributes, [key]: value };
                setSelectedAttributes(nextAttrs);

                let match = product.variants.find(v => {
                  const vAttrs = getParsedAttributes(v);
                  return Object.entries(nextAttrs).every(([k, val]) => {
                    const attrVal = vAttrs[k];
                    if (k.toLowerCase().includes('size') && typeof attrVal === 'string' && attrVal.includes(',')) {
                      return attrVal.split(',').map(s => s.trim()).includes(val);
                    }
                    return attrVal === val;
                  });
                });

                if (!match) {
                  match = product.variants.find(v => {
                    const attrVal = getParsedAttributes(v)[key];
                    if (key.toLowerCase().includes('size') && typeof attrVal === 'string' && attrVal.includes(',')) {
                      return attrVal.split(',').map(s => s.trim()).includes(value);
                    }
                    return attrVal === value;
                  });
                  if (match) {
                    const parsed = getParsedAttributes(match);
                    const newAttrs = {};
                    Object.entries(parsed).forEach(([k, v]) => {
                      if (k.toLowerCase().includes('size') && typeof v === 'string' && v.includes(',')) {
                        newAttrs[k] = value;
                      } else {
                        newAttrs[k] = v;
                      }
                    });
                    setSelectedAttributes(newAttrs);
                  }
                }

                if (match) {
                  setSelectedVariant(match);
                  if (match.images && match.images.length > 0) {
                    setSelectedImage(match.images[0].url);
                  }
                } else {
                  setSelectedVariant(null);
                }
              };

              const getVariantImageForValue = (key, val) => {
                const testAttrs = { ...selectedAttributes, [key]: val };
                let match = product.variants.find(v => {
                  const vAttrs = getParsedAttributes(v);
                  return Object.entries(testAttrs).every(([k, vVal]) => {
                    const attrVal = vAttrs[k];
                    if (k.toLowerCase().includes('size') && typeof attrVal === 'string' && attrVal.includes(',')) {
                      return attrVal.split(',').map(s => s.trim()).includes(vVal);
                    }
                    return attrVal === vVal;
                  });
                });

                if (!match || !match.images?.length) {
                  match = product.variants.find(v => getParsedAttributes(v)[key] === val && v.images?.length > 0);
                }

                if (match && match.images?.length > 0) {
                  return match.images[0].url;
                }

                return product.images?.[0]?.url || 'https://placehold.co/100x130?text=No+Image';
              };

              const sortedKeys = [...attributeKeys].sort((a, b) => {
                const aSize = a.toLowerCase().includes('size');
                const bSize = b.toLowerCase().includes('size');
                if (aSize && !bSize) return -1;
                if (!aSize && bSize) return 1;
                return 0;
              });

              return (
                <div className="border-t border-[#EBE7DF] pt-5 space-y-5">
                  {sortedKeys.map(key => {
                    const values = getValuesForAttribute(key);
                    const isColorKey = key.toLowerCase().includes('color') || key.toLowerCase().includes('colour');

                    return (
                      <div key={key}>
                        <div className="flex items-center justify-between mb-2.5">
                          <h3 className="text-xs uppercase tracking-wider font-extrabold text-[#1A1817]">{key}</h3>
                        </div>

                        <div className="flex flex-wrap gap-3">
                          {values.map(val => {
                            const isSelected = selectedAttributes[key] === val;
                            const isAvailable = isOptionSelectable(key, val);

                            if (isColorKey) {
                              const imageUrl = getVariantImageForValue(key, val);
                              return (
                                <button
                                  key={val}
                                  onClick={() => handleSelectAttribute(key, val)}
                                  className="group flex flex-col items-center gap-1.5 focus:outline-none"
                                >
                                  <div className={`w-12 h-16 rounded-xl overflow-hidden border-2 bg-white flex-shrink-0 transition-all shadow-sm
                                    ${isSelected
                                      ? 'border-[#8C7A65] ring-2 ring-[#8C7A65]/25 scale-105'
                                      : isAvailable
                                        ? 'border-[#EBE7DF] hover:border-neutral-400'
                                        : 'border-[#EBE7DF]/45 opacity-40'
                                    }`}
                                  >
                                    <img src={imageUrl} alt={val} className="w-full h-full object-cover" />
                                  </div>
                                  <span className={`text-[9px] font-bold uppercase tracking-wider transition-colors ${
                                    isSelected 
                                      ? 'text-[#8C7A65]' 
                                      : isAvailable 
                                        ? 'text-[#6B5A47]' 
                                        : 'text-[#6B5A47]/45 line-through'
                                  }`}>
                                    {val}
                                  </span>
                                </button>
                              );
                            }

                            // Circular size badges
                            return (
                              <button
                                key={val}
                                onClick={() => handleSelectAttribute(key, val)}
                                className={`w-11 h-11 rounded-full border flex items-center justify-center font-bold text-xs transition-all relative ${
                                  isSelected
                                    ? 'border-[#8C7A65] bg-white text-[#8C7A65] ring-1 ring-[#8C7A65]'
                                    : isAvailable
                                      ? 'border-[#EBE7DF] bg-white text-neutral-800 hover:border-neutral-400'
                                      : 'border-[#EBE7DF]/45 bg-white/40 text-neutral-400 line-through cursor-not-allowed'
                                }`}
                              >
                                {val}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                  {!selectedVariant && (
                    <p className="text-red-500 text-[10px] font-bold uppercase tracking-wide mt-2">
                      ⚠️ Selected combination is unavailable. Please choose another option.
                    </p>
                  )}
                </div>
              );
            })()}

            <div className="border-t border-[#EBE7DF] pt-5">
              <h3 className="text-xs uppercase tracking-wider font-extrabold text-[#1A1817] mb-2.5">Product Description</h3>
              <p className="text-[#6B5A47] text-xs leading-relaxed whitespace-pre-line">
                {product.description}
              </p>
            </div>

            {/* Actions CTA: StreetStore Charcoal ADD TO BAG */}
            <div className="border-t border-[#EBE7DF] pt-6 pb-12">
              <div className="flex gap-4">
                <button
                  onClick={() => handleAction('cart')}
                  disabled={addingToCart || buyingNow || !selectedVariant || selectedVariant.stock === 0}
                  className="flex-1 bg-[#1C1917] hover:bg-[#2C2927] disabled:bg-neutral-300 text-white text-xs font-bold uppercase tracking-widest py-4 px-6 rounded-xl transition-all shadow-md active:scale-[0.98] disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                  <span>
                    {addingToCart ? "Adding..." : !selectedVariant ? "Select Options" : selectedVariant.stock === 0 ? "Out of Stock" : "Add to Bag"}
                  </span>
                </button>
                <button
                  onClick={() => handleAction('buy')}
                  disabled={addingToCart || buyingNow || !selectedVariant || selectedVariant.stock === 0}
                  className="flex-1 bg-white border border-[#EBE7DF] text-neutral-800 hover:bg-[#FAF9F5] text-xs font-bold uppercase tracking-widest py-4 px-6 rounded-xl transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  
                  <span>Go to Cart</span>
                </button>
              </div>
              <p className="text-[9px] text-center text-[#B5ADA2] uppercase tracking-wider font-semibold mt-4">
                100% Original Products · Easy 14 days returns &amp; exchanges
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
