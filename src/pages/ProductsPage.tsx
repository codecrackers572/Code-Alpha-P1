import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SlidersHorizontal, X, ChevronDown } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Product, Category } from '../lib/types';
import ProductCard from '../components/ProductCard';
import { ProductGridSkeleton } from '../components/Loading';

export default function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  const category = searchParams.get('category') || '';
  const query = searchParams.get('q') || '';
  const sort = searchParams.get('sort') || 'newest';
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';
  const featuredOnly = searchParams.get('featured') === 'true';

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    let dbQuery = supabase.from('products').select('*, categories(*)');

    if (category) {
      const { data: cat } = await supabase.from('categories').select('id').eq('slug', category).maybeSingle();
      if (cat) dbQuery = dbQuery.eq('category_id', cat.id);
    }
    if (query) {
      dbQuery = dbQuery.or(`name.ilike.%${query}%,description.ilike.%${query}%`);
    }
    if (featuredOnly) {
      dbQuery = dbQuery.eq('featured', true);
    }
    if (minPrice) dbQuery = dbQuery.gte('price', parseFloat(minPrice));
    if (maxPrice) dbQuery = dbQuery.lte('price', parseFloat(maxPrice));

    switch (sort) {
      case 'price-low': dbQuery = dbQuery.order('price', { ascending: true }); break;
      case 'price-high': dbQuery = dbQuery.order('price', { ascending: false }); break;
      case 'rating': dbQuery = dbQuery.order('rating', { ascending: false }); break;
      case 'discount': dbQuery = dbQuery.order('compare_price', { ascending: false }); break;
      default: dbQuery = dbQuery.order('created_at', { ascending: false });
    }

    const { data } = await dbQuery.limit(48);
    setProducts(data ?? []);
    setLoading(false);
  }, [category, query, sort, minPrice, maxPrice, featuredOnly]);

  useEffect(() => {
    supabase.from('categories').select('*').then(({ data }) => setCategories(data ?? []));
  }, []);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  function updateParam(key: string, value: string) {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value); else next.delete(key);
    setSearchParams(next);
  }

  function clearFilters() {
    setSearchParams(new URLSearchParams());
  }

  const activeFilters = [category, query, minPrice, maxPrice, featuredOnly ? 'featured' : ''].filter(Boolean).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold font-display text-gray-900">
          {category ? category.charAt(0).toUpperCase() + category.slice(1).replace('-', ' ') : 'All Products'}
        </h1>
        <p className="text-gray-500 mt-1">{loading ? 'Loading...' : `${products.length} products found`}</p>
      </div>

      <div className="flex gap-6">
        {/* Sidebar Filters */}
        <aside className={`fixed lg:sticky top-16 left-0 z-40 w-72 h-[calc(100vh-4rem)] bg-white overflow-y-auto transition-transform duration-300 lg:translate-x-0 ${showFilters ? 'translate-x-0' : '-translate-x-full'} lg:top-20 lg:h-auto`}>
          <div className="p-5 space-y-6">
            <div className="flex items-center justify-between lg:hidden">
              <h2 className="font-semibold">Filters</h2>
              <button onClick={() => setShowFilters(false)}><X className="w-5 h-5" /></button>
            </div>

            {/* Categories */}
            <div>
              <h3 className="font-semibold text-sm mb-3 text-gray-900">Categories</h3>
              <div className="space-y-2">
                <button
                  onClick={() => updateParam('category', '')}
                  className={`block w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${!category ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-600 hover:bg-gray-50'}`}
                >
                  All Categories
                </button>
                {categories.map(c => (
                  <button
                    key={c.id}
                    onClick={() => updateParam('category', c.slug)}
                    className={`block w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${category === c.slug ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-600 hover:bg-gray-50'}`}
                  >
                    {c.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Price range */}
            <div>
              <h3 className="font-semibold text-sm mb-3 text-gray-900">Price Range</h3>
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={minPrice}
                  onChange={e => updateParam('minPrice', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="number"
                  placeholder="Max"
                  value={maxPrice}
                  onChange={e => updateParam('maxPrice', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Featured */}
            <div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={featuredOnly}
                  onChange={e => updateParam('featured', e.target.checked ? 'true' : '')}
                  className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Featured only</span>
              </label>
            </div>

            {activeFilters > 0 && (
              <button onClick={clearFilters} className="w-full py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                Clear All Filters
              </button>
            )}
          </div>
        </aside>

        {/* Overlay for mobile */}
        {showFilters && <div className="fixed inset-0 bg-black/30 z-30 lg:hidden" onClick={() => setShowFilters(false)} />}

        {/* Main content */}
        <div className="flex-1 min-w-0">
          {/* Toolbar */}
          <div className="flex items-center justify-between mb-6">
            <button onClick={() => setShowFilters(true)} className="lg:hidden flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 text-sm font-medium">
              <SlidersHorizontal className="w-4 h-4" /> Filters {activeFilters > 0 && `(${activeFilters})`}
            </button>

            <div className="relative ml-auto">
              <select
                value={sort}
                onChange={e => updateParam('sort', e.target.value)}
                className="appearance-none pl-4 pr-10 py-2.5 rounded-xl border border-gray-200 text-sm font-medium bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
              >
                <option value="newest">Newest First</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Top Rated</option>
                <option value="discount">Biggest Discount</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* Products grid */}
          {loading ? (
            <ProductGridSkeleton count={12} />
          ) : products.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {products.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          ) : (
            <div className="text-center py-20">
              <p className="text-gray-500 text-lg">No products found matching your filters.</p>
              {activeFilters > 0 && (
                <button onClick={clearFilters} className="mt-4 text-blue-600 font-semibold hover:text-blue-700">Clear filters</button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
