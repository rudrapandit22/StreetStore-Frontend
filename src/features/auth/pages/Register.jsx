import React, { useState } from 'react';
import { useauth } from '../hook/useAuth.js';
import { useNavigate } from 'react-router';
import ContinuewithGoogle from '../components/ContinuewithGoogle.jsx';

const Register = () => {
  const { handleregister, error } = useauth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    fullname: '',
    contact: '',
    email: '',
    password: '',
    isSeller: false,
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [localError, setLocalError] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));

    setLocalError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMsg('');
    setLocalError('');

    if (formData.fullname.trim().length < 3) {
      setLocalError('Full name must be at least 3 characters long');
      return;
    }
    if (!/^\d{10}$/.test(formData.contact)) {
      setLocalError('Contact number must be exactly 10 digits');
      return;
    }
    if (formData.password.length < 8) {
      setLocalError('Password must be at least 8 characters long');
      return;
    }

    setIsSubmitting(true);
    const result = await handleregister({
      fullname: formData.fullname,
      contact: formData.contact,
      email: formData.email,
      password: formData.password,
      isSeller: formData.isSeller,
    });
    setIsSubmitting(false);

    if (result.success) {
      // Redirect based on role
      if (result.user?.role === 'seller') {
        navigate('/seller/dashboard');
      } else {
        navigate('/');
      }
    }
  };

  return (
    <div className="relative min-h-screen w-full bg-[#FAF9F5] flex items-center justify-center p-4 overflow-hidden font-sans">
      {/* Decorative Sandy Beige Ambient Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[450px] h-[450px] rounded-full bg-[#EAE3D2]/35 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[450px] h-[450px] rounded-full bg-[#E3D9C6]/30 blur-[120px] pointer-events-none" />

      {/* Main Container */}
      <div className="relative w-full max-w-md bg-white border border-[#EBE7DF] rounded-3xl p-8 md:p-12 shadow-[0_8px_30px_rgb(230,225,215,0.25)] overflow-hidden transition-all duration-300">
        {/* Subtle Linen Background Texture */}
        <div 
          className="absolute inset-0 opacity-[0.15] bg-cover bg-center pointer-events-none"
          style={{ backgroundImage: "url('/card_bg_texture.jpg')" }}
        />
        
        {/* Logo/Header Area */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 bg-[#F5F1E9] border border-[#E2D8C6] rounded-2xl flex items-center justify-center mb-4 shadow-sm">
            <svg className="w-6 h-6 text-[#6B5A47]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </div>
          <h2 className="text-[#1A1817] text-3xl font-extrabold tracking-widest text-center uppercase font-serif">StreetStore</h2>
          <p className="text-[#4C453C] text-[10px] mt-2.5 text-center uppercase tracking-widest font-semibold">Premium Apparel & Streetwear</p>
        </div>

        {/* Message Notifications */}
        {(error || localError) && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-start space-x-3">
            <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span>{localError || error}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm flex items-start space-x-3">
            <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{successMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Full Name */}
          <div>
            <label htmlFor="fullname" className="block text-[#1C1A17] text-[10px] font-bold uppercase tracking-wider mb-2">
              Full Name
            </label>
            <input
              type="text"
              id="fullname"
              name="fullname"
              autoComplete="name"
              required
              placeholder="Ex:Rudra pandit"
              value={formData.fullname}
              onChange={handleChange}
              className="w-full bg-[#FAF8F5] border border-[#E6E1D8] rounded-xl px-4 py-3 text-[#1C1A17] placeholder-neutral-400 focus:outline-none focus:border-[#8C7A65] focus:ring-1 focus:ring-[#8C7A65]/20 transition-all text-sm"
            />
          </div>

          {/* Contact Number */}
          <div>
            <label htmlFor="contact" className="block text-[#1C1A17] text-[10px] font-bold uppercase tracking-wider mb-2">
              Contact Number
            </label>
            <input
              type="tel"
              id="contact"
              name="contact"
              autoComplete="tel"
              required
              inputMode="numeric"
              pattern="[0-9]{10}"
              placeholder="e.g. 9876543210"
              value={formData.contact}
              onChange={handleChange}
              className="w-full bg-[#FAF8F5] border border-[#E6E1D8] rounded-xl px-4 py-3 text-[#1C1A17] placeholder-neutral-400 focus:outline-none focus:border-[#8C7A65] focus:ring-1 focus:ring-[#8C7A65]/20 transition-all text-sm"
            />
          </div>

          {/* Email Address */}
          <div>
            <label htmlFor="email" className="block text-[#1C1A17] text-[10px] font-bold uppercase tracking-wider mb-2">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              autoComplete="username"
              required
              placeholder="john.doe@email.com"
              value={formData.email}
              onChange={handleChange}
              className="w-full bg-[#FAF8F5] border border-[#E6E1D8] rounded-xl px-4 py-3 text-[#1C1A17] placeholder-neutral-400 focus:outline-none focus:border-[#8C7A65] focus:ring-1 focus:ring-[#8C7A65]/20 transition-all text-sm"
            />
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="block text-[#1C1A17] text-[10px] font-bold uppercase tracking-wider mb-2">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                autoComplete="new-password"
                required
                placeholder="Min. 8 characters"
                value={formData.password}
                onChange={handleChange}
                className="w-full bg-[#FAF8F5] border border-[#E6E1D8] rounded-xl pl-4 pr-11 py-3 text-[#1C1A17] placeholder-neutral-400 focus:outline-none focus:border-[#8C7A65] focus:ring-1 focus:ring-[#8C7A65]/20 transition-all text-sm"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 transition-colors focus:outline-none"
              >
                {showPassword ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Seller Flag */}
          <div className="flex items-center space-x-3 py-1">
            <label htmlFor="isSeller" className="flex items-center cursor-pointer select-none text-[#1C1A17] hover:text-black transition-colors">
              <input
                type="checkbox"
                id="isSeller"
                name="isSeller"
                checked={formData.isSeller}
                onChange={handleChange}
                className="w-5 h-5 rounded border border-[#C5BEB2] bg-[#FAF8F5] text-[#8C7A65] focus:ring-0 focus:ring-offset-0 focus:outline-none cursor-pointer accent-[#8C7A65] mr-3"
              />
              <span className="text-sm">Register as a Brand / Seller</span>
            </label>
          </div>

          {/* OR Divider */}
          <div className="flex items-center my-4 gap-3">
            <div className="flex-1 h-px bg-[#E6E1D8]" />
            <span className="text-[#9C9188] text-[11px] font-semibold uppercase tracking-widest">or</span>
            <div className="flex-1 h-px bg-[#E6E1D8]" />
          </div>

          <ContinuewithGoogle/>


          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-[#1C1917] hover:bg-[#2C2927] text-white font-semibold py-3.5 px-4 rounded-xl shadow-md transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed text-center select-none mt-2"
          >
            {isSubmitting ? (
              <div className="flex items-center justify-center space-x-2">
                <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>Creating account...</span>
              </div>
            ) : (
              'Register'
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="text-[#5C554D] text-xs text-center mt-8">
          Already have an account?{' '}
          <a href="/login" className="text-[#3C3227] hover:text-black transition-colors font-bold">
            Log In
          </a>
        </div>

      </div>
    </div>
  );
};

export default Register;
