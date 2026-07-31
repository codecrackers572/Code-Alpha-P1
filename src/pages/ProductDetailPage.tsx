import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Star, Heart, ShoppingBag, Minus, Plus, ChevronRight, Truck, ShieldCheck, RefreshCw } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Product, Review } from '../lib/types';
import { formatPrice, discountPercent, formatDate } from '../lib/utils';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import ProductCard from '../components/ProductCard';
import { LoadingSpinner } from '../components/Loading';

export default function ProductDetailPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { user } = useAuth();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [related, setRelated] = useState<Product[]>([]);
  const [wished, setWished] = useState(false);
  const [adding, setAdding] = useState(false);
  const [reviewForm, setReviewForm] = useState({ rating: 5, title: '', body: '' });
  const [reviewSubmitting, setReviewSubmitting] = useState(false);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    (async () => {
      const { data: prod } = await supabase.from('products').select('*, categories(*)').eq('slug', slug).maybeSingle();
      setProduct(prod);
      setActiveImage(0);
      setQuantity(1);
      setLoading(false);

      if (prod) {
        const [{ data: revs }, { data: rel }] = await Promise.all([
          supabase.from('reviews').select('*, profiles(full_name, avatar_url)').eq('product_id', prod.id).order('created_at', { ascending: false }),
          supabase.from('products').select('*, categories(*)').neq('id', prod.id).limit(4),
        ]);
        setReviews(revs ?? []);
        setRelated(rel ?? []);

        if (user) {
          const { data: wish } = await supabase.from('wishlists').select('id').eq('product_id', prod.id).eq('user_id', user.id).maybeSingle();
          setWished(!!wish);
        }
      }
    })();
  }, [slug, user]);

  async function handleAddToCart() {
    if (!user) { navigate('/auth'); return; }
    if (!product) return;
    setAdding(true);
    await addToCart(product.id, quantity);
    setAdding(false);
  }

  async function toggleWishlist() {
    if (!user) { navigate('/auth'); return; }
    if (!product) return;
    if (wished) {
      await supabase.from('wishlists').delete().eq('product_id', product.id).eq('user_id', user.id);
      setWished(false);
    } else {
      await supabase.from('wishlists').insert({ product_id: product.id, user_id: user.id });
      setWished(true);
    }
  }

  async function submitReview(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !product) return;
    setReviewSubmitting(true);
    const { data } = await supabase.from('reviews')
      .insert({ product_id: product.id, user_id: user.id, rating: reviewForm.rating, title: reviewForm.title, body: reviewForm.body })
      .select('*, profiles(full_name, avatar_url)')
      .single();
    if (data) {
      setReviews(prev => [data, ...prev]);
      setReviewForm({ rating: 5, title: '', body: '' });
    }
    setReviewSubmitting(false);
  }

  if (loading) return <LoadingSpinner label="Loading product..." />;
  if (!product) return (
    <div className="max-w-7xl mx-auto px-4 py-20 text-center">
      <p className="text-gray-500 text-lg">Product not found.</p>
      <Link to="/products" className="mt-4 inline-block text-blue-600 font-semibold">Back to products</Link>
    </div>
  );

  const discount = discountPercent(product.price, product.compare_price);
  const images = product.images?.length ? product.images : ['https://images.pexels.com/photos/90946/pexels-photo-90946.jpeg?auto=compress&cs=tinysrgb&h=650&w=940'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link to="/" className="hover:text-blue-600">Home</Link>
        <ChevronRight className="w-4 h-4" />
        <Link to="/products" className="hover:text-blue-600">Products</Link>
        {product.categories && (
          <>
            <ChevronRight className="w-4 h-4" />
            <Link to={`/products?category=${product.categories.slug}`} className="hover:text-blue-600">{product.categories.name}</Link>
          </>
        )}
        <ChevronRight className="w-4 h-4" />
        <span className="text-gray-900 font-medium truncate">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
        {/* Images */}
        <div>
          <div className="aspect-square rounded-2xl overflow-hidden bg-gray-100 mb-4">
            <img src={images[activeImage]} alt={product.name} className="w-full h-full object-cover" />
          </div>
          {images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(i)}
                  className={`w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 border-2 transition-colors ${activeImage === i ? 'border-blue-600' : 'border-transparent'}`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div>
          {product.categories && (
            <Link to={`/products?category=${product.categories.slug}`} className="text-sm text-blue-600 font-medium uppercase tracking-wide">
              {product.categories.name}
            </Link>
          )}
          <h1 className="text-2xl sm:text-3xl font-bold font-display text-gray-900 mt-2 mb-3">{product.name}</h1>

          {/* Rating */}
          <div className="flex items-center gap-2 mb-4">
            <div className="flex">
              {[1, 2, 3, 4, 5].map(n => (
                <Star key={n} className={`w-4 h-4 ${n <= Math.round(product.rating) ? 'star-filled fill-current' : 'star-empty'}`} />
              ))}
            </div>
            <span className="text-sm text-gray-500">{product.rating} ({product.review_count} reviews)</span>
          </div>

          {/* Price */}
          <div className="flex items-center gap-3 mb-6">
            <span className="text-3xl font-bold text-gray-900">{formatPrice(product.price)}</span>
            {product.compare_price && (
              <>
                <span className="text-lg text-gray-400 line-through">{formatPrice(product.compare_price)}</span>
                <span className="badge bg-red-100 text-red-700">Save {discount}%</span>
              </>
            )}
          </div>

          <p className="text-gray-600 leading-relaxed mb-6">{product.description}</p>

          {/* Stock */}
          <div className="mb-6">
            {product.stock > 0 ? (
              <span className="inline-flex items-center gap-2 text-sm text-green-600 font-medium">
                <span className="w-2 h-2 rounded-full bg-green-500" /> In Stock ({product.stock} available)
              </span>
            ) : (
              <span className="inline-flex items-center gap-2 text-sm text-red-600 font-medium">
                <span className="w-2 h-2 rounded-full bg-red-500" /> Out of Stock
              </span>
            )}
          </div>

          {/* Quantity + Add to cart */}
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <div className="flex items-center border border-gray-200 rounded-xl">
              <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="p-3 hover:bg-gray-50 rounded-l-xl" aria-label="Decrease">
                <Minus className="w-4 h-4" />
              </button>
              <span className="px-4 py-3 font-semibold min-w-[3rem] text-center">{quantity}</span>
              <button onClick={() => setQuantity(q => Math.min(product.stock, q + 1))} className="p-3 hover:bg-gray-50 rounded-r-xl" aria-label="Increase">
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <button
              onClick={handleAddToCart}
              disabled={adding || product.stock === 0}
              className="btn-primary flex-1"
            >
              <ShoppingBag className="w-5 h-5" />
              {adding ? 'Adding...' : 'Add to Cart'}
            </button>
            <button
              onClick={toggleWishlist}
              className="p-3 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors"
              aria-label="Toggle wishlist"
            >
              <Heart className={`w-5 h-5 ${wished ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} />
            </button>
          </div>

          {/* Trust badges */}
          <div className="grid grid-cols-3 gap-4 py-6 border-t border-gray-100">
            <div className="flex flex-col items-center text-center gap-2">
              <Truck className="w-6 h-6 text-blue-600" />
              <span className="text-xs text-gray-600">Free Shipping</span>
            </div>
            <div className="flex flex-col items-center text-center gap-2">
              <ShieldCheck className="w-6 h-6 text-blue-600" />
              <span className="text-xs text-gray-600">Secure Payment</span>
            </div>
            <div className="flex flex-col items-center text-center gap-2">
              <RefreshCw className="w-6 h-6 text-blue-600" />
              <span className="text-xs text-gray-600">Easy Returns</span>
            </div>
          </div>

          {/* Tags */}
          {product.tags?.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {product.tags.map(tag => (
                <span key={tag} className="badge bg-gray-100 text-gray-600">#{tag}</span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Reviews */}
      <section className="mt-16">
        <h2 className="text-2xl font-bold font-display mb-6">Customer Reviews ({reviews.length})</h2>

        {/* Review form */}
        {user ? (
          <form onSubmit={submitReview} className="card p-6 mb-8">
            <h3 className="font-semibold mb-4">Write a Review</h3>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-sm text-gray-600">Your rating:</span>
              {[1, 2, 3, 4, 5].map(n => (
                <button key={n} type="button" onClick={() => setReviewForm(f => ({ ...f, rating: n }))}>
                  <Star className={`w-6 h-6 ${n <= reviewForm.rating ? 'star-filled fill-current' : 'star-empty'}`} />
                </button>
              ))}
            </div>
            <input
              type="text"
              placeholder="Review title"
              value={reviewForm.title}
              onChange={e => setReviewForm(f => ({ ...f, title: e.target.value }))}
              className="input-field mb-3"
            />
            <textarea
              placeholder="Share your thoughts..."
              value={reviewForm.body}
              onChange={e => setReviewForm(f => ({ ...f, body: e.target.value }))}
              rows={3}
              className="input-field mb-3 resize-none"
            />
            <button type="submit" disabled={reviewSubmitting} className="btn-primary">
              {reviewSubmitting ? 'Submitting...' : 'Submit Review'}
            </button>
          </form>
        ) : (
          <div className="card p-6 mb-8 text-center">
            <p className="text-gray-600 mb-3">Sign in to write a review</p>
            <Link to="/auth" className="btn-primary">Sign In</Link>
          </div>
        )}

        {/* Reviews list */}
        {reviews.length > 0 ? (
          <div className="space-y-4">
            {reviews.map(r => (
              <div key={r.id} className="card p-5">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold flex-shrink-0">
                    {(r.profiles?.full_name || 'U').charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-semibold text-sm">{r.profiles?.full_name || 'Anonymous'}</h4>
                      <span className="text-xs text-gray-400">{formatDate(r.created_at)}</span>
                    </div>
                    <div className="flex mb-2">
                      {[1, 2, 3, 4, 5].map(n => (
                        <Star key={n} className={`w-3.5 h-3.5 ${n <= r.rating ? 'star-filled fill-current' : 'star-empty'}`} />
                      ))}
                    </div>
                    {r.title && <h5 className="font-semibold text-sm mb-1">{r.title}</h5>}
                    {r.body && <p className="text-sm text-gray-600">{r.body}</p>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">No reviews yet. Be the first to review!</p>
        )}
      </section>

      {/* Related products */}
      {related.length > 0 && (
        <section className="mt-16">
          <h2 className="text-2xl font-bold font-display mb-6">You May Also Like</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {related.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      )}
    </div>
  );
}
