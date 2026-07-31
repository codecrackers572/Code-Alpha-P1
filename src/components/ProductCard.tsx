import { Link } from 'react-router-dom';
import { Star, Heart, ShoppingBag } from 'lucide-react';
import { Product } from '../lib/types';
import { formatPrice, discountPercent } from '../lib/utils';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { useState } from 'react';
import { useCart } from '../context/CartContext';

export default function ProductCard({ product }: { product: Product }) {
  const { user } = useAuth();
  const { addToCart } = useCart();
  const [wished, setWished] = useState(false);
  const [adding, setAdding] = useState(false);

  const discount = discountPercent(product.price, product.compare_price);
  const image = product.images?.[0] || 'https://images.pexels.com/photos/90946/pexels-photo-90946.jpeg?auto=compress&cs=tinysrgb&h=650&w=940';

  async function toggleWishlist(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!user) return;
    if (wished) {
      await supabase.from('wishlists').delete().eq('product_id', product.id).eq('user_id', user.id);
      setWished(false);
    } else {
      await supabase.from('wishlists').insert({ product_id: product.id, user_id: user.id });
      setWished(true);
    }
  }

  async function handleAddToCart(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      window.location.href = '/auth';
      return;
    }
    setAdding(true);
    await addToCart(product.id);
    setAdding(false);
  }

  return (
    <Link to={`/products/${product.slug}`} className="card group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col">
      <div className="relative aspect-square overflow-hidden bg-gray-100">
        <img
          src={image}
          alt={product.name}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {discount > 0 && (
          <span className="absolute top-3 left-3 badge bg-red-500 text-white">-{discount}%</span>
        )}
        {product.featured && (
          <span className="absolute top-3 right-12 badge bg-blue-600 text-white">Featured</span>
        )}
        <button
          onClick={toggleWishlist}
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 flex items-center justify-center hover:bg-white transition-colors"
          aria-label="Toggle wishlist"
        >
          <Heart className={`w-4 h-4 ${wished ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} />
        </button>
      </div>

      <div className="p-4 flex flex-col flex-1">
        {product.categories && (
          <span className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-1">{product.categories.name}</span>
        )}
        <h3 className="font-semibold text-gray-900 text-sm line-clamp-2 mb-1 group-hover:text-blue-600 transition-colors">{product.name}</h3>

        <div className="flex items-center gap-1 mb-2">
          {[1, 2, 3, 4, 5].map(n => (
            <Star key={n} className={`w-3 h-3 ${n <= Math.round(product.rating) ? 'star-filled fill-current' : 'star-empty'}`} />
          ))}
          <span className="text-xs text-gray-400 ml-1">({product.review_count})</span>
        </div>

        <div className="flex items-center gap-2 mb-3 mt-auto">
          <span className="text-lg font-bold text-gray-900">{formatPrice(product.price)}</span>
          {product.compare_price && (
            <span className="text-sm text-gray-400 line-through">{formatPrice(product.compare_price)}</span>
          )}
        </div>

        <button
          onClick={handleAddToCart}
          disabled={adding || product.stock === 0}
          className="w-full py-2.5 bg-gray-900 text-white rounded-xl text-sm font-semibold hover:bg-blue-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
        >
          <ShoppingBag className="w-4 h-4" />
          {product.stock === 0 ? 'Out of Stock' : adding ? 'Adding...' : 'Add to Cart'}
        </button>
      </div>
    </Link>
  );
}
