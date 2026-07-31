export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  created_at: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  compare_price: number | null;
  stock: number;
  category_id: string | null;
  images: string[];
  tags: string[];
  rating: number;
  review_count: number;
  featured: boolean;
  created_at: string;
  categories?: Category;
}

export interface Profile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  phone: string | null;
  created_at: string;
}

export interface CartItem {
  id: string;
  user_id: string;
  product_id: string;
  quantity: number;
  created_at: string;
  products?: Product;
}

export interface Order {
  id: string;
  user_id: string;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  subtotal: number;
  shipping_cost: number;
  tax: number;
  total: number;
  shipping_address: ShippingAddress | null;
  payment_method: string;
  created_at: string;
  order_items?: OrderItem[];
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string | null;
  quantity: number;
  price: number;
  product_snapshot: ProductSnapshot | null;
  created_at: string;
  products?: Product;
}

export interface ProductSnapshot {
  name: string;
  image: string;
  price: number;
}

export interface Review {
  id: string;
  product_id: string;
  user_id: string;
  rating: number;
  title: string | null;
  body: string | null;
  created_at: string;
  profiles?: Pick<Profile, 'full_name' | 'avatar_url'>;
}

export interface WishlistItem {
  id: string;
  user_id: string;
  product_id: string;
  created_at: string;
  products?: Product;
}

export interface Bundle {
  id: string;
  creator_id: string;
  name: string;
  description: string | null;
  product_ids: string[];
  discount_percent: number;
  is_public: boolean;
  likes: number;
  created_at: string;
  profiles?: Pick<Profile, 'full_name'>;
}

export interface ShippingAddress {
  label?: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

export interface CartState {
  items: CartItem[];
  loading: boolean;
}
