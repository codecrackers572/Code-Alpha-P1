import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Sparkles, Plus, Minus, Check, TrendingUp, Gift, Save, Share2, Star } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Product, Bundle } from '../lib/types';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { formatPrice } from '../lib/utils';
import { LoadingSpinner } from '../components/Loading';

const TIERS = [
  { min: 2, discount: 5, label: 'Starter', icon: Star },
  { min: 3, discount: 10, label: 'Saver', icon: Save },
  { min: 4, discount: 15, label: 'Smart', icon: TrendingUp },
  { min: 5, discount: 20, label: 'Pro', icon: Gift },
  { min: 6, discount: 25, label: 'Elite', icon: Sparkles },
];

export default function BundleBuilderPage() {
  const { user } = useAuth();
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [publicBundles, setPublicBundles] = useState<any[]>([]);
  const [bundleName, setBundleName] = useState('');
  const [bundleDesc, setBundleDesc] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    (async () => {
      const [{ data: prods }, { data: bundles }] = await Promise.all([
        supabase.from('products').select('*, categories(*)').limit(24),
        supabase.from('bundles').select('*, profiles(full_name)').eq('is_public', true).order('likes', { ascending: false }).limit(6),
      ]);
      setProducts(prods ?? []);
      setPublicBundles(bundles ?? []);
      setLoading(false);
    })();
  }, []);

  const selectedProducts = products.filter(p => selected.includes(p.id));
  const subtotal = selectedProducts.reduce((sum, p) => sum + p.price, 0);
  const currentTier = [...TIERS].reverse().find(t => selected.length >= t.min) || TIERS[0];
  const discount = selected.length >= 2 ? currentTier.discount : 0;
  const savings = subtotal * (discount / 100);
  const total = subtotal - savings;

  function toggleProduct(id: string) {
    setSelected(prev => prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]);
    setSaved(false);
  }

  async function saveBundle() {
    if (!user) { navigate('/auth'); return; }
    if (selected.length < 2) return;
    setSaving(true);
    await supabase.from('bundles').insert({
      creator_id: user.id,
      name: bundleName || `My ${currentTier.label} Bundle`,
      description: bundleDesc,
      product_ids: selected,
      discount_percent: discount,
      is_public: true,
    });
    setSaving(false);
    setSaved(true);
    setBundleName('');
    setBundleDesc('');
  }

  async function addBundleToCart() {
    if (!user) { navigate('/auth'); return; }
    for (const id of selected) {
      await addToCart(id);
    }
    navigate('/cart');
  }

  if (loading) return <LoadingSpinner label="Loading products..." />;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-full mb-4">
          <Sparkles className="w-4 h-4 text-blue-600" />
          <span className="text-sm font-semibold text-blue-600">Exclusive Feature</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold font-display text-gray-900 mb-3">Smart Bundle Builder</h1>
        <p className="text-gray-500 max-w-2xl mx-auto">
          Mix and match products to create your own bundle. The more you add, the more you save — up to 25% off!
        </p>
      </div>

      {/* Tier progress */}
      <div className="card p-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-lg">Discount Tiers</h2>
          <span className="text-sm text-gray-500">{selected.length} items selected</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {TIERS.map(tier => {
            const active = selected.length >= tier.min;
            const current = currentTier.discount === tier.discount && selected.length >= 2;
            return (
              <div
                key={tier.label}
                className={`relative p-4 rounded-xl text-center transition-all ${current ? 'bg-blue-600 text-white scale-105 shadow-lg' : active ? 'bg-blue-50 text-blue-600' : 'bg-gray-50 text-gray-400'}`}
              >
                <tier.icon className="w-6 h-6 mx-auto mb-2" />
                <p className="font-bold text-lg">{tier.discount}%</p>
                <p className="text-xs">{tier.label}</p>
                <p className="text-xs opacity-75">{tier.min}+ items</p>
                {current && (
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-white text-blue-600 rounded-full flex items-center justify-center shadow">
                    <Check className="w-4 h-4" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Product picker */}
        <div className="lg:col-span-2">
          <h2 className="font-bold text-lg mb-4">Choose Products</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {products.map(p => {
              const isSelected = selected.includes(p.id);
              return (
                <button
                  key={p.id}
                  onClick={() => toggleProduct(p.id)}
                  className={`card text-left group relative transition-all ${isSelected ? 'ring-2 ring-blue-600' : 'hover:shadow-md'}`}
                >
                  <div className="aspect-square overflow-hidden bg-gray-100 rounded-t-2xl relative">
                    <img
                      src={p.images?.[0] || 'https://images.pexels.com/photos/90946/pexels-photo-90946.jpeg?auto=compress&cs=tinysrgb&h=650&w=940'}
                      alt={p.name}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                    <div className={`absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center transition-all ${isSelected ? 'bg-blue-600 text-white' : 'bg-white/80 text-gray-400'}`}>
                      {isSelected ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                    </div>
                  </div>
                  <div className="p-3">
                    <p className="text-xs font-medium text-gray-900 line-clamp-2">{p.name}</p>
                    <p className="text-sm font-bold text-blue-600 mt-1">{formatPrice(p.price)}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Bundle summary */}
        <div className="lg:col-span-1">
          <div className="card p-6 sticky top-20">
            <h2 className="font-bold text-lg mb-4">Your Bundle</h2>

            {selectedProducts.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-8">Select products to start building your bundle.</p>
            ) : (
              <>
                <div className="space-y-2 max-h-48 overflow-y-auto mb-4">
                  {selectedProducts.map(p => (
                    <div key={p.id} className="flex items-center gap-2 text-sm">
                      <div className="w-10 h-10 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                        <img src={p.images?.[0]} alt="" className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{p.name}</p>
                        <p className="text-gray-400">{formatPrice(p.price)}</p>
                      </div>
                      <button onClick={() => toggleProduct(p.id)} className="p-1 text-gray-400 hover:text-red-500">
                        <Minus className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>

                {discount > 0 && (
                  <div className="bg-green-50 rounded-xl p-3 mb-4 text-sm">
                    <div className="flex items-center gap-2 text-green-600 font-semibold mb-1">
                      <Save className="w-4 h-4" /> You save {discount}%!
                    </div>
                    <p className="text-green-600">Tier: {currentTier.label}</p>
                  </div>
                )}

                <div className="space-y-2 text-sm border-t border-gray-100 pt-3">
                  <div className="flex justify-between"><span className="text-gray-600">Subtotal</span><span>{formatPrice(subtotal)}</span></div>
                  {discount > 0 && (
                    <div className="flex justify-between text-green-600"><span>Discount ({discount}%)</span><span>-{formatPrice(savings)}</span></div>
                  )}
                  <div className="flex justify-between font-bold text-lg border-t border-gray-100 pt-2"><span>Total</span><span>{formatPrice(total)}</span></div>
                </div>

                <button onClick={addBundleToCart} className="btn-primary w-full mt-4">
                  Add All to Cart
                </button>

                {/* Save bundle */}
                <div className="mt-6 pt-6 border-t border-gray-100">
                  <h3 className="font-semibold text-sm mb-3">Save & Share Your Bundle</h3>
                  <input
                    type="text"
                    value={bundleName}
                    onChange={e => setBundleName(e.target.value)}
                    placeholder="Bundle name (optional)"
                    className="input-field mb-2 text-sm"
                  />
                  <textarea
                    value={bundleDesc}
                    onChange={e => setBundleDesc(e.target.value)}
                    placeholder="Description (optional)"
                    rows={2}
                    className="input-field mb-3 text-sm resize-none"
                  />
                  <button onClick={saveBundle} disabled={saving || !user} className="btn-secondary w-full text-sm">
                    {saving ? 'Saving...' : saved ? 'Saved!' : <><Share2 className="w-4 h-4" /> Share Bundle</>}
                  </button>
                  {!user && <p className="text-xs text-gray-400 mt-2 text-center">Sign in to save bundles</p>}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Community bundles */}
      {publicBundles.length > 0 && (
        <section className="mt-16">
          <h2 className="text-2xl font-bold font-display mb-6">Community Bundles</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {publicBundles.map(b => (
              <div key={b.id} className="card p-5">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold">{b.name}</h3>
                  <span className="badge bg-blue-100 text-blue-700">{b.discount_percent}% off</span>
                </div>
                {b.description && <p className="text-sm text-gray-500 mb-3">{b.description}</p>}
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <span>by {b.profiles?.full_name || 'Anonymous'}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1"><TrendingUp className="w-3.5 h-3.5" /> {b.likes} likes</span>
                </div>
                <p className="text-xs text-gray-400 mt-2">{b.product_ids?.length || 0} products</p>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
