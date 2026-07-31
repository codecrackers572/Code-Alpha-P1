import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { CartItem } from '../lib/types';
import { useAuth } from './AuthContext';

interface CartContextType {
  items: CartItem[];
  loading: boolean;
  addToCart: (productId: string, quantity?: number) => Promise<void>;
  removeFromCart: (itemId: string) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  itemCount: number;
  total: number;
}

const CartContext = createContext<CartContextType>({} as CartContextType);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (user) loadCart();
    else setItems([]);
  }, [user]);

  async function loadCart() {
    setLoading(true);
    const { data } = await supabase
      .from('cart_items')
      .select('*, products(*, categories(*))')
      .order('created_at');
    setItems(data ?? []);
    setLoading(false);
  }

  async function addToCart(productId: string, quantity = 1) {
    if (!user) return;
    const existing = items.find(i => i.product_id === productId);
    if (existing) {
      await updateQuantity(existing.id, existing.quantity + quantity);
    } else {
      const { data } = await supabase
        .from('cart_items')
        .insert({ product_id: productId, quantity })
        .select('*, products(*, categories(*))')
        .single();
      if (data) setItems(prev => [...prev, data]);
    }
  }

  async function removeFromCart(itemId: string) {
    await supabase.from('cart_items').delete().eq('id', itemId);
    setItems(prev => prev.filter(i => i.id !== itemId));
  }

  async function updateQuantity(itemId: string, quantity: number) {
    if (quantity <= 0) return removeFromCart(itemId);
    const { data } = await supabase
      .from('cart_items')
      .update({ quantity })
      .eq('id', itemId)
      .select('*, products(*, categories(*))')
      .single();
    if (data) setItems(prev => prev.map(i => i.id === itemId ? data : i));
  }

  async function clearCart() {
    if (!user) return;
    await supabase.from('cart_items').delete().eq('user_id', user.id);
    setItems([]);
  }

  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);
  const total = items.reduce((sum, i) => sum + (i.products?.price ?? 0) * i.quantity, 0);

  return (
    <CartContext.Provider value={{ items, loading, addToCart, removeFromCart, updateQuantity, clearCart, itemCount, total }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
