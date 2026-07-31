import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, ShoppingBag } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Product } from '../lib/types';
import { useAuth } from '../context/AuthContext';
import ProductCard from '../components/ProductCard';
import { ProductGridSkeleton } from '../components/Loading';

export default function WishlistPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [items, setItems] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { navigate('/auth'); return; }
    (async () => {
      const { data } = await supabase
        .from('wishlists')
        .select('products(*, categories(*))')
        .order('created_at', { ascending: false });
      setItems((data ?? []).map((w: any) => w.products).filter(Boolean));
      setLoading(false);
    })();
  }, [user, navigate]);

  if (!user) return null;
  if (loading) return <ProductGridSkeleton count={4} />;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold font-display text-gray-900 mb-2">My Wishlist</h1>
      <p className="text-gray-500 mb-8">Products you've saved for later</p>

      {items.length === 0 ? (
        <div className="text-center py-20">
          <Heart className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <h2 className="text-xl font-bold mb-2">Your wishlist is empty</h2>
          <p className="text-gray-500 mb-6">Tap the heart icon on products to save them here.</p>
          <Link to="/products" className="btn-primary">Browse Products <ShoppingBag className="w-4 h-4" /></Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {items.map(p => <ProductCard key={p.id} product={p} />)}
        </div>
      )}
    </div>
  );
}
