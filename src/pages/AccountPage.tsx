import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User as UserIcon, Mail, Phone, Package, Heart, LayoutGrid, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { LoadingSpinner } from '../components/Loading';

export default function AccountPage() {
  const { user, profile, signOut, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [phone, setPhone] = useState(profile?.phone || '');
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState(false);
  const [orderCount, setOrderCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);

  useEffect(() => {
    if (!authLoading && !user) navigate('/auth');
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || '');
      setPhone(profile.phone || '');
    }
  }, [profile]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const [{ count: oc }, { count: wc }] = await Promise.all([
        supabase.from('orders').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
        supabase.from('wishlists').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
      ]);
      setOrderCount(oc ?? 0);
      setWishlistCount(wc ?? 0);
    })();
  }, [user]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    await supabase.from('profiles').update({ full_name: fullName, phone }).eq('id', user.id);
    setSaving(false);
    setSavedMsg(true);
    setTimeout(() => setSavedMsg(false), 3000);
  }

  if (authLoading || !user) return <LoadingSpinner />;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold font-display text-gray-900 mb-8">My Account</h1>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="card p-5 text-center">
          <Package className="w-8 h-8 mx-auto text-blue-600 mb-2" />
          <p className="text-2xl font-bold">{orderCount}</p>
          <p className="text-xs text-gray-500">Orders</p>
        </div>
        <div className="card p-5 text-center">
          <Heart className="w-8 h-8 mx-auto text-red-500 mb-2" />
          <p className="text-2xl font-bold">{wishlistCount}</p>
          <p className="text-xs text-gray-500">Wishlist</p>
        </div>
        <div className="card p-5 text-center">
          <LayoutGrid className="w-8 h-8 mx-auto text-green-600 mb-2" />
          <p className="text-2xl font-bold">0</p>
          <p className="text-xs text-gray-500">Bundles</p>
        </div>
      </div>

      {/* Profile form */}
      <div className="card p-6 mb-6">
        <h2 className="font-bold text-lg mb-4">Profile Information</h2>
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Full Name</label>
            <div className="relative">
              <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input value={fullName} onChange={e => setFullName(e.target.value)} className="input-field pl-10" placeholder="Your name" />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input value={user.email || ''} disabled className="input-field pl-10 bg-gray-50 text-gray-500" />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Phone</label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input value={phone} onChange={e => setPhone(e.target.value)} className="input-field pl-10" placeholder="+1 (555) 000-0000" />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button type="submit" disabled={saving} className="btn-primary">
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
            {savedMsg && <span className="text-sm text-green-600 font-medium">Saved!</span>}
          </div>
        </form>
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <button onClick={() => navigate('/orders')} className="card p-5 text-left hover:shadow-md transition-shadow">
          <Package className="w-6 h-6 text-blue-600 mb-2" />
          <h3 className="font-semibold text-sm">My Orders</h3>
          <p className="text-xs text-gray-500">Track and view purchases</p>
        </button>
        <button onClick={() => navigate('/wishlist')} className="card p-5 text-left hover:shadow-md transition-shadow">
          <Heart className="w-6 h-6 text-red-500 mb-2" />
          <h3 className="font-semibold text-sm">Wishlist</h3>
          <p className="text-xs text-gray-500">Saved products</p>
        </button>
        <button onClick={() => { signOut(); navigate('/'); }} className="card p-5 text-left hover:shadow-md transition-shadow">
          <LogOut className="w-6 h-6 text-red-500 mb-2" />
          <h3 className="font-semibold text-sm">Sign Out</h3>
          <p className="text-xs text-gray-500">Log out of account</p>
        </button>
      </div>
    </div>
  );
}
