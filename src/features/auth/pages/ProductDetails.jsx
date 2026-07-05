import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { useproduct } from '../hooks/useproducts';
import { useSelector } from 'react-redux';
import { Link } from 'react-router';

const ProductDetails = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { handlegetproductbyid } = useproduct();
  const user = useSelector((state) => state.auth.user);

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedImage, setSelectedImage] = useState('');
  const [addingToCart, setAddingToCart] = useState(false);
  const [buyingNow, setBuyingNow] = useState(false);

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

  const handleAction = (actionType) => {
    if (!user) {
      alert("Please log in to continue.");
      navigate('/login');
      return;
    }

    if (actionType === 'cart') {
      setAddingToCart(true);
      setTimeout(() => {
        setAddingToCart(false);
        alert(`${product.title} has been added to your cart.`);
      }, 800);
    } else if (actionType === 'buy') {
      setBuyingNow(true);
      setTimeout(() => {
        setBuyingNow(false);
        alert(`Proceeding to checkout with ${product.title}.`);
      }, 800);
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
          <button className="relative text-[#1C1917] hover:text-[#8C7A65] transition-colors p-1" aria-label="Cart">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            <span className="absolute top-0 right-0 w-2 h-2 bg-[#8C7A65] rounded-full"></span>
          </button>
        </div>
      </nav>

      {/* Main product view */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Images Section */}
          <div className="space-y-4">
            <div className="aspect-[3/4] bg-white border border-[#EBE7DF] rounded-2xl overflow-hidden shadow-sm relative">
              <img
                src={selectedImage || 'https://placehold.co/600x800?text=No+Image'}
                alt={product.title}
                className="w-full h-full object-cover"
              />
            </div>
            {product.images?.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(img.url)}
                    className={`w-20 aspect-[3/4] rounded-lg overflow-hidden border-2 bg-white flex-shrink-0 transition-all
                      ${selectedImage === img.url ? 'border-[#8C7A65]' : 'border-[#EBE7DF] hover:border-[#C5BEB2]'}`}
                  >
                    <img src={img.url} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details Section */}
          <div className="flex flex-col justify-between py-2">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold font-serif tracking-wide text-[#1C1917]">
                {product.title}
              </h1>
              <div className="mt-3 text-lg font-extrabold tracking-wider text-[#8C7A65]">
                {product.price?.currency || 'INR'} {product.price?.amount}
              </div>
              <div className="mt-6 border-t border-[#EBE7DF] pt-6">
                <h3 className="text-xs uppercase tracking-wider font-bold text-[#1C1917]">Description</h3>
                <p className="mt-3 text-[#6B5A47] text-sm leading-relaxed whitespace-pre-line">
                  {product.description}
                </p>
              </div>
            </div>

            {/* Actions CTA */}
            <div className="mt-10 space-y-4 border-t border-[#EBE7DF] pt-8">
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => handleAction('cart')}
                  disabled={addingToCart || buyingNow}
                  className="bg-white border border-[#1C1917] text-[#1C1917] hover:bg-[#FAF9F5] text-xs uppercase font-bold tracking-widest py-4 px-6 rounded-xl transition-all active:scale-[0.98] disabled:opacity-50"
                >
                  {addingToCart ? "Adding..." : "Add to Cart"}
                </button>
                <button
                  onClick={() => handleAction('buy')}
                  disabled={addingToCart || buyingNow}
                  className="bg-[#1C1917] text-white hover:bg-[#2C2927] text-xs uppercase font-bold tracking-widest py-4 px-6 rounded-xl shadow-md transition-all active:scale-[0.98] disabled:opacity-50"
                >
                  {buyingNow ? "Processing..." : "Buy Now"}
                </button>
              </div>
              <p className="text-[10px] text-center text-[#B5ADA2] uppercase tracking-wider font-semibold">
                Free shipping &amp; simple returns nationwide
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
