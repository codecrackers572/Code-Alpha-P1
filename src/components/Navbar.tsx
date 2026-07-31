import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingBag, Search, User, Heart, Menu, X, Package, LogOut, LayoutGrid } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useState, useEffect } from 'react';

export default function Navbar() {
  const { user, profile, signOut } = useAuth();
  const { itemCount } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setSearchOpen(false);
    setUserMenuOpen(false);
  }, [location.pathname]);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery('');
    }
  }

  return (
    <>
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/95 backdrop-blur-md shadow-md' : 'bg-white/80 backdrop-blur-sm'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center group-hover:scale-110 transition-transform">
                <ShoppingBag className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold font-display text-gray-900">ShopLux</span>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-6">
              <Link to="/" className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors">Home</Link>
              <Link to="/products" className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors">Shop All</Link>
              <Link to="/products?category=fashion" className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors">Fashion</Link>
              <Link to="/products?category=electronics" className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors">Electronics</Link>
              <Link to="/products?category=home-decor" className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors">Home</Link>
              <Link to="/bundle-builder" className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors font-semibold">Bundle Builder</Link>
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-1 sm:gap-2">
              <button onClick={() => setSearchOpen(!searchOpen)} className="p-2 rounded-lg hover:bg-gray-100 transition-colors" aria-label="Search">
                <Search className="w-5 h-5 text-gray-700" />
              </button>

              {user ? (
                <div className="relative">
                  <button onClick={() => setUserMenuOpen(!userMenuOpen)} className="p-2 rounded-lg hover:bg-gray-100 transition-colors flex items-center gap-1" aria-label="Account">
                    <User className="w-5 h-5 text-gray-700" />
                    <span className="hidden sm:inline text-sm font-medium text-gray-700 max-w-[80px] truncate">{profile?.full_name || 'Account'}</span>
                  </button>
                  {userMenuOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 py-2 animate-scale-in">
                      <Link to="/account" className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50">
                        <User className="w-4 h-4" /> My Account
                      </Link>
                      <Link to="/orders" className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50">
                        <Package className="w-4 h-4" /> My Orders
                      </Link>
                      <Link to="/wishlist" className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50">
                        <Heart className="w-4 h-4" /> Wishlist
                      </Link>
                      <Link to="/bundle-builder" className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50">
                        <LayoutGrid className="w-4 h-4" /> Bundle Builder
                      </Link>
                      <hr className="my-1 border-gray-100" />
                      <button onClick={() => { signOut(); navigate('/'); }} className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 w-full text-left">
                        <LogOut className="w-4 h-4" /> Sign Out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link to="/auth" className="p-2 rounded-lg hover:bg-gray-100 transition-colors" aria-label="Sign in">
                  <User className="w-5 h-5 text-gray-700" />
                </Link>
              )}

              <Link to="/cart" className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors" aria-label="Cart">
                <ShoppingBag className="w-5 h-5 text-gray-700" />
                {itemCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-blue-600 text-white text-xs font-bold rounded-full flex items-center justify-center animate-scale-in">
                    {itemCount}
                  </span>
                )}
              </Link>

              <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors" aria-label="Menu">
                {mobileOpen ? <X className="w-5 h-5 text-gray-700" /> : <Menu className="w-5 h-5 text-gray-700" />}
              </button>
            </div>
          </div>

          {/* Search bar */}
          {searchOpen && (
            <div className="pb-4 animate-slide-up">
              <form onSubmit={handleSearch} className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search for products..."
                  autoFocus
                  className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </form>
            </div>
          )}
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden bg-white border-t border-gray-100 animate-slide-up">
            <nav className="flex flex-col px-4 py-3 gap-1">
              <Link to="/" className="px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">Home</Link>
              <Link to="/products" className="px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">Shop All</Link>
              <Link to="/products?category=fashion" className="px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">Fashion</Link>
              <Link to="/products?category=electronics" className="px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">Electronics</Link>
              <Link to="/products?category=home-decor" className="px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">Home Decor</Link>
              <Link to="/products?category=beauty" className="px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">Beauty</Link>
              <Link to="/bundle-builder" className="px-3 py-2.5 rounded-lg text-sm font-bold text-blue-600 hover:bg-blue-50">Bundle Builder</Link>
              {user && <Link to="/orders" className="px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">My Orders</Link>}
              {user && <Link to="/wishlist" className="px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">Wishlist</Link>}
            </nav>
          </div>
        )}
      </header>
      <div className="h-16" />
    </>
  );
}
