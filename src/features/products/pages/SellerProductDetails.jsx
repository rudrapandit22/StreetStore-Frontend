import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router';
import { useproduct } from '../hooks/useproducts';
import { getImagekitAuth } from '../services/product.api';
import ImageKit from 'imagekit-javascript';

const CURRENCY_SYMBOLS = { INR: '₹', USD: '$', EUR: '€', GBP: '£', AED: 'د.إ', JPY: '¥' };

async function uploadToImageKit(file) {
  try {
    const auth = await getImagekitAuth();
    const ik = new ImageKit({
      publicKey: auth.publicKey,
      urlEndpoint: auth.urlEndpoint,
    });

    const result = await ik.upload({
      file,
      fileName: `snitch_var_${Date.now()}_${file.name}`,
      folder: '/snitch/variants',
      token: auth.token,
      signature: auth.signature,
      expire: auth.expire,
    });

    return result.url;
  } catch (err) {
    console.error("Error in variant uploadToImageKit:", err);
    throw err;
  }
}

const SellerProductDetails = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { handlegetproductbyid, handleaddvariant, handleupdatevariantstock } = useproduct();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedImage, setSelectedImage] = useState('');

  // Variant editing/creation state
  const [variantForm, setVariantForm] = useState({
    stock: 0,
    priceAmount: '',
    priceMrp: '',
    priceCurrency: 'INR',
    size: '',
    color: ''
  });
  const [variantImages, setVariantImages] = useState([]); // { file, preview }
  const [variantUploading, setVariantUploading] = useState(false);
  const [variantError, setVariantError] = useState('');

  // Stock edit state
  const [editingVariantId, setEditingVariantId] = useState(null);
  const [editStockVal, setEditStockVal] = useState('');
  const [stockUpdating, setStockUpdating] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const prod = await handlegetproductbyid(productId);
        setProduct(prod);
        if (prod?.images?.length > 0) {
          setSelectedImage(prod.images[0].url);
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
          <Link to="/seller/dashboard" className="mt-4 inline-block bg-[#1C1917] text-white text-xs uppercase font-bold tracking-widest px-4 py-2.5 rounded-lg hover:bg-[#2C2927] transition-all">
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const symbol = CURRENCY_SYMBOLS[product.price?.currency] ?? product.price?.currency ?? '₹';

  // Image Upload Handlers
  const handleVariantImageChange = (e) => {
    const files = Array.from(e.target.files);
    const remaining = 7 - variantImages.length;
    if (remaining <= 0) return;
    const accepted = files.slice(0, remaining).map(file => ({
      file,
      preview: URL.createObjectURL(file)
    }));
    setVariantImages(prev => [...prev, ...accepted]);
  };

  const handleRemoveVariantImage = (index) => {
    URL.revokeObjectURL(variantImages[index].preview);
    setVariantImages(prev => prev.filter((_, idx) => idx !== index));
  };

  // Submit Variant
  const handleAddVariantSubmit = async (e) => {
    e.preventDefault();
    setVariantError('');
    setVariantUploading(true);

    if (!variantForm.size.trim()) {
      setVariantError('Size is required.');
      setVariantUploading(false);
      return;
    }

    try {
      const attributesObj = {
        Size: variantForm.size.trim()
      };
      if (variantForm.color.trim()) {
        attributesObj["Color"] = variantForm.color.trim();
      }

      const variantData = {
        images: variantImages,
        stock: variantForm.stock,
        priceAmount: variantForm.priceAmount,
        priceMrp: variantForm.priceMrp,
        priceCurrency: variantForm.priceCurrency,
        attributes: attributesObj
      };

      const updatedProduct = await handleaddvariant(product._id, variantData);
      setProduct(updatedProduct);

      // Reset form
      setVariantForm({
        stock: 0,
        priceAmount: '',
        priceMrp: '',
        priceCurrency: 'INR',
        size: '',
        color: ''
      });
      variantImages.forEach(img => URL.revokeObjectURL(img.preview));
      setVariantImages([]);
    } catch (err) {
      console.error("Variant creation submission error detail:", err);
      setVariantError(err.message || 'Failed to create variant');
    } finally {
      setVariantUploading(false);
    }
  };

  // Update Stock
  const handleSaveStock = async (variantId) => {
    if (isNaN(Number(editStockVal)) || Number(editStockVal) < 0) {
      alert("Please enter a valid stock number.");
      return;
    }
    setStockUpdating(true);
    try {
      const updatedProduct = await handleupdatevariantstock(product._id, variantId, Number(editStockVal));
      setProduct(updatedProduct);
      setEditingVariantId(null);
    } catch (err) {
      alert(err.message || 'Failed to update stock');
    } finally {
      setStockUpdating(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF9F5] font-sans pb-16">
      {/* Top Header Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-[#EBE7DF] px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/seller/dashboard')}
            className="flex items-center justify-center w-8 h-8 rounded-full border border-[#EBE7DF] text-[#6B5A47] hover:bg-[#F5F2ED] transition-colors"
            aria-label="Go back to seller hub"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <span className="text-sm font-bold uppercase tracking-wider text-[#6B5A47]">
            Product Details
          </span>
        </div>
        <Link to="/" className="text-lg font-extrabold tracking-widest uppercase font-serif text-[#1C1917]">
          STREETSTORE
        </Link>
      </nav>

      {/* Main Container */}
      <div className="max-w-5xl mx-auto px-6 mt-8">
        <div className="bg-white border border-[#EBE7DF] rounded-3xl overflow-hidden shadow-sm p-6 sm:p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-start">
            
            {/* Left: Images Column */}
            <div className="space-y-4 max-w-[380px] mx-auto w-full">
              <div className="aspect-[3/4] bg-white border border-[#EBE7DF] rounded-2xl overflow-hidden shadow-sm relative">
                <img
                  src={selectedImage || 'https://placehold.co/600x800?text=No+Image'}
                  alt={product.title}
                  className="w-full h-full object-cover"
                />
              </div>
              
              {product.images?.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
                  {product.images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImage(img.url)}
                      className={`w-14 aspect-[3/4] rounded-lg overflow-hidden border-2 bg-white flex-shrink-0 transition-all
                        ${selectedImage === img.url ? 'border-[#8C7A65]' : 'border-[#EBE7DF] hover:border-[#C5BEB2]'}`}
                    >
                      <img src={img.url} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Right: Details Column */}
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-bold font-serif tracking-wide text-[#1C1917]">
                  {product.title}
                </h1>
                <div className="mt-2 text-xl font-extrabold tracking-wider text-[#8C7A65]">
                  {symbol}{product.price?.amount?.toLocaleString()}
                </div>
              </div>

              <div className="border-t border-[#EBE7DF] pt-4">
                <h3 className="text-xs uppercase tracking-wider font-bold text-[#1C1917] mb-2">Description</h3>
                <p className="text-[#6B5A47] text-sm leading-relaxed whitespace-pre-line">
                  {product.description || "No description provided."}
                </p>
              </div>

              <div className="border-t border-[#EBE7DF] pt-4 grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-[10px] uppercase tracking-wider font-bold text-[#B5ADA2]">Created On</h4>
                  <p className="text-sm font-semibold text-[#1C1917] mt-1">
                    {new Date(product.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric', month: 'long', year: 'numeric'
                    })}
                  </p>
                </div>
                <div>
                  <h4 className="text-[10px] uppercase tracking-wider font-bold text-[#B5ADA2]">Currency</h4>
                  <p className="text-sm font-semibold text-[#1C1917] mt-1">
                    {product.price?.currency || "INR"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Variants Section */}
          <div className="border-t border-[#EBE7DF] mt-10 pt-8">
            <div className="mb-6">
              <h2 className="text-lg font-bold font-serif tracking-wide text-[#1C1917]">
                Product Variants
              </h2>
            </div>

            {/* Add Variant Form */}
            <form onSubmit={handleAddVariantSubmit} className="bg-[#FAF9F5] border border-[#EBE7DF] rounded-2xl p-5 mb-8 space-y-4">
                <h3 className="text-sm font-bold text-[#1C1917] uppercase tracking-wider">New Variant Details</h3>
                
                {variantError && (
                  <p className="text-red-500 text-xs font-medium">{variantError}</p>
                )}

                {/* Fixed attributes: Size and Color */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs uppercase tracking-wider font-bold text-[#1C1917] mb-1">Size</label>
                    <input
                      type="text"
                      placeholder="e.g. 32, 34, 36, L, XL"
                      value={variantForm.size}
                      onChange={(e) => setVariantForm(prev => ({ ...prev, size: e.target.value }))}
                      className="bg-white border border-[#EBE7DF] rounded-xl px-3 py-2 text-xs w-full focus:outline-none focus:border-[#8C7A65]"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-wider font-bold text-[#1C1917] mb-1">Color (Optional)</label>
                    <input
                      type="text"
                      placeholder="e.g. Black, White, Blue"
                      value={variantForm.color}
                      onChange={(e) => setVariantForm(prev => ({ ...prev, color: e.target.value }))}
                      className="bg-white border border-[#EBE7DF] rounded-xl px-3 py-2 text-xs w-full focus:outline-none focus:border-[#8C7A65]"
                    />
                  </div>
                              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                  {/* Stock */}
                  <div>
                    <label className="block text-xs uppercase tracking-wider font-bold text-[#1C1917] mb-1">Stock</label>
                    <input
                      type="number"
                      value={variantForm.stock}
                      onChange={(e) => setVariantForm(prev => ({ ...prev, stock: Math.max(0, parseInt(e.target.value) || 0) }))}
                      className="bg-white border border-[#EBE7DF] rounded-xl px-3 py-2 text-xs w-full focus:outline-none focus:border-[#8C7A65]"
                      min="0"
                      required
                    />
                  </div>

                  {/* Optional Price */}
                  <div>
                    <label className="block text-xs uppercase tracking-wider font-bold text-[#1C1917] mb-1">Price (Optional)</label>
                    <input
                      type="number"
                      placeholder="Inherit base price"
                      value={variantForm.priceAmount}
                      onChange={(e) => setVariantForm(prev => ({ ...prev, priceAmount: e.target.value }))}
                      className="bg-white border border-[#EBE7DF] rounded-xl px-3 py-2 text-xs w-full focus:outline-none focus:border-[#8C7A65]"
                      min="0"
                    />
                  </div>

                  {/* MRP */}
                  <div>
                    <label className="block text-xs uppercase tracking-wider font-bold text-[#1C1917] mb-1">MRP (Optional)</label>
                    <input
                      type="number"
                      placeholder="e.g. 1399"
                      value={variantForm.priceMrp}
                      onChange={(e) => setVariantForm(prev => ({ ...prev, priceMrp: e.target.value }))}
                      className="bg-white border border-[#EBE7DF] rounded-xl px-3 py-2 text-xs w-full focus:outline-none focus:border-[#8C7A65]"
                      min="0"
                    />
                  </div>

                  {/* Currency */}
                  <div>
                    <label className="block text-xs uppercase tracking-wider font-bold text-[#1C1917] mb-1">Currency</label>
                    <select
                      value={variantForm.priceCurrency}
                      onChange={(e) => setVariantForm(prev => ({ ...prev, priceCurrency: e.target.value }))}
                      className="bg-white border border-[#EBE7DF] rounded-xl px-3 py-2 text-xs w-full focus:outline-none focus:border-[#8C7A65]"
                    >
                      <option value="INR">INR (₹)</option>
                      <option value="USD">USD ($)</option>
                      <option value="EUR">EUR (€)</option>
                      <option value="JPY">JPY (¥)</option>
                    </select>
                  </div>
                </div>         </div>

                {/* Images Upload (Upto 7 images) */}
                <div>
                  <label className="block text-xs uppercase tracking-wider font-bold text-[#1C1917] mb-1">Images (Optional, Max 7)</label>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleVariantImageChange}
                    disabled={variantImages.length >= 7}
                    className="block w-full text-xs text-[#6B5A47] file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-[#1C1917] file:text-white hover:file:bg-[#2C2927]"
                  />
                  {variantImages.length > 0 && (
                    <div className="flex gap-2 flex-wrap mt-3">
                      {variantImages.map((img, idx) => (
                        <div key={idx} className="relative w-12 h-16 rounded-lg overflow-hidden border border-[#EBE7DF]">
                          <img src={img.preview} alt="" className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => handleRemoveVariantImage(idx)}
                            className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-0.5 text-[8px] hover:bg-red-700"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={variantUploading}
                  className="bg-[#1C1917] text-white hover:bg-[#2C2927] text-xs font-semibold px-4 py-2.5 rounded-xl transition-all disabled:opacity-50"
                >
                  {variantUploading ? "Creating..." : "Save Variant"}
                </button>
              </form>

            {/* List of variants */}
            {product.variants && product.variants.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {product.variants.map((variant, idx) => {
                  const getAttributeEntries = (attrs) => {
                    if (!attrs) return [];
                    if (typeof attrs.toJSON === 'function') {
                      return Object.entries(attrs.toJSON());
                    }
                    if (attrs instanceof Map) {
                      return Array.from(attrs.entries());
                    }
                    if (Array.isArray(attrs)) {
                      return attrs.map(item => [item.key, item.value]);
                    }
                    return Object.entries(attrs);
                  };
                  const attributes = getAttributeEntries(variant.attributes);
                  const varSymbol = CURRENCY_SYMBOLS[variant.price?.currency] ?? variant.price?.currency ?? symbol;
                  const isEditingStock = editingVariantId === variant._id;

                  return (
                    <div
                      key={variant._id || idx}
                      className="border border-[#EBE7DF] rounded-2xl p-4 flex gap-4 bg-[#FAF9F5] hover:shadow-md transition-shadow relative"
                    >
                      {variant.images && variant.images.length > 0 && (
                        <div className="w-16 h-20 rounded-lg overflow-hidden border border-[#EBE7DF] flex-shrink-0">
                          <img
                            src={variant.images[0].url}
                            alt={`Variant ${idx + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}

                      <div className="flex-1 space-y-2 min-w-0">
                        <div className="flex justify-between items-start">
                          <h4 className="font-bold text-sm text-[#1C1917]">Variant #{idx + 1}</h4>
                          <span className="font-extrabold text-sm text-[#8C7A65]">
                            {varSymbol}{variant.price?.amount?.toLocaleString()}
                          </span>
                        </div>

                        {attributes.length > 0 && (
                          <div className="flex flex-wrap gap-1.5">
                            {attributes.map(([key, val]) => (
                              <span
                                key={key}
                                className="text-[10px] bg-white border border-[#EBE7DF] text-[#6B5A47] px-2 py-0.5 rounded-md font-medium"
                              >
                                {key}: {val}
                              </span>
                            ))}
                          </div>
                        )}

                        <div className="border-t border-[#EBE7DF]/60 pt-2 flex flex-col gap-2">
                          {isEditingStock ? (
                            <div className="flex items-center gap-1.5">
                              <input
                                type="number"
                                value={editStockVal}
                                onChange={(e) => setEditStockVal(Math.max(0, parseInt(e.target.value) || 0))}
                                className="bg-white border border-[#EBE7DF] rounded-lg px-2 py-1 text-xs w-16 focus:outline-none focus:border-[#8C7A65]"
                                min="0"
                              />
                              <button
                                onClick={() => handleSaveStock(variant._id)}
                                disabled={stockUpdating}
                                className="bg-emerald-600 text-white text-[10px] font-bold px-2.5 py-1 rounded-lg hover:bg-emerald-700 disabled:opacity-50"
                              >
                                {stockUpdating ? "..." : "Save"}
                              </button>
                              <button
                                onClick={() => setEditingVariantId(null)}
                                className="bg-white border border-[#EBE7DF] text-[#6B5A47] text-[10px] font-bold px-2.5 py-1 rounded-lg hover:bg-[#F5F2ED]"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <div className="flex justify-between items-center text-[11px]">
                              <span className="text-[#9C9188]">Stock: <span className={`font-bold ${variant.stock > 0 ? 'text-emerald-600' : 'text-red-500'}`}>{variant.stock > 0 ? `${variant.stock} units` : 'Out of stock'}</span></span>
                              <button
                                onClick={() => {
                                  setEditingVariantId(variant._id);
                                  setEditStockVal(variant.stock);
                                }}
                                className="text-[#8C7A65] hover:text-[#6B5A47] font-bold underline transition-colors"
                              >
                                Edit Stock
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 bg-[#FAF9F5] border border-dashed border-[#E2D8C6] rounded-2xl">
                <p className="text-[#9C9188] text-sm font-medium">No variants added for this product.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SellerProductDetails;