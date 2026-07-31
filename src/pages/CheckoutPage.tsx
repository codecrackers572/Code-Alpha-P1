import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { CreditCard, MapPin, CheckCircle, ArrowRight } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { formatPrice } from '../lib/utils';
import { ShippingAddress } from '../lib/types';

export default function CheckoutPage() {
  const { items, total, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState<'shipping' | 'payment' | 'done'>('shipping');
  const [processing, setProcessing] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [form, setForm] = useState<ShippingAddress>({
    label: 'Home',
    street: '',
    city: '',
    state: '',
    zip: '',
    country: 'US',
  });
  const [card, setCard] = useState({ number: '', name: '', expiry: '', cvc: '' });

  if (!user) {
    navigate('/auth');
    return null;
  }

  if (items.length === 0 && step !== 'done') {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold font-display mb-2">Your cart is empty</h1>
        <Link to="/products" className="btn-primary mt-4">Start Shopping</Link>
      </div>
    );
  }

  const shipping = total > 50 ? 0 : 5.99;
  const tax = total * 0.08;
  const grandTotal = total + shipping + tax;

  async function placeOrder() {
    setProcessing(true);
    const { data: order } = await supabase.from('orders').insert({
      user_id: user!.id,
      status: 'confirmed',
      subtotal: total,
      shipping_cost: shipping,
      tax,
      total: grandTotal,
      shipping_address: form,
      payment_method: 'card',
    }).select().single();

    if (order) {
      const orderItems = items.map(item => ({
        order_id: order.id,
        product_id: item.product_id,
        quantity: item.quantity,
        price: item.products?.price ?? 0,
        product_snapshot: { name: item.products?.name, image: item.products?.images?.[0], price: item.products?.price },
      }));
      await supabase.from('order_items').insert(orderItems);
      await clearCart();
      setOrderId(order.id);
      setStep('done');
    }
    setProcessing(false);
  }

  if (step === 'done') {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6 animate-scale-in">
          <CheckCircle className="w-10 h-10 text-green-600" />
        </div>
        <h1 className="text-3xl font-bold font-display mb-3">Order Confirmed!</h1>
        <p className="text-gray-500 mb-2">Thank you for your purchase.</p>
        <p className="text-sm text-gray-400 mb-6">Order ID: {orderId?.slice(0, 8)}</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/orders" className="btn-primary">View My Orders</Link>
          <Link to="/products" className="btn-secondary">Continue Shopping</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold font-display text-gray-900 mb-8">Checkout</h1>

      {/* Steps indicator */}
      <div className="flex items-center gap-4 mb-8">
        <div className="flex items-center gap-2">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${step === 'shipping' ? 'bg-blue-600 text-white' : 'bg-green-500 text-white'}`}>
            {step === 'shipping' ? '1' : <CheckCircle className="w-4 h-4" />}
          </div>
          <span className="text-sm font-medium">Shipping</span>
        </div>
        <div className="flex-1 h-0.5 bg-gray-200" />
        <div className="flex items-center gap-2">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${step === 'payment' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'}`}>2</div>
          <span className="text-sm font-medium">Payment</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {step === 'shipping' && (
            <div className="card p-6">
              <div className="flex items-center gap-2 mb-6">
                <MapPin className="w-5 h-5 text-blue-600" />
                <h2 className="font-bold text-lg">Shipping Address</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Street Address</label>
                  <input value={form.street} onChange={e => setForm(f => ({ ...f, street: e.target.value }))} className="input-field" placeholder="123 Main St" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">City</label>
                  <input value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))} className="input-field" placeholder="New York" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">State</label>
                  <input value={form.state} onChange={e => setForm(f => ({ ...f, state: e.target.value }))} className="input-field" placeholder="NY" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">ZIP Code</label>
                  <input value={form.zip} onChange={e => setForm(f => ({ ...f, zip: e.target.value }))} className="input-field" placeholder="10001" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Country</label>
                  <input value={form.country} onChange={e => setForm(f => ({ ...f, country: e.target.value }))} className="input-field" placeholder="US" />
                </div>
              </div>
              <button
                onClick={() => setStep('payment')}
                disabled={!form.street || !form.city || !form.state || !form.zip}
                className="btn-primary mt-6"
              >
                Continue to Payment <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {step === 'payment' && (
            <div className="card p-6">
              <div className="flex items-center gap-2 mb-6">
                <CreditCard className="w-5 h-5 text-blue-600" />
                <h2 className="font-bold text-lg">Payment Details</h2>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Card Number</label>
                  <input value={card.number} onChange={e => setCard(c => ({ ...c, number: e.target.value }))} className="input-field" placeholder="4242 4242 4242 4242" maxLength={19} />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Name on Card</label>
                  <input value={card.name} onChange={e => setCard(c => ({ ...c, name: e.target.value }))} className="input-field" placeholder="John Doe" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">Expiry</label>
                    <input value={card.expiry} onChange={e => setCard(c => ({ ...c, expiry: e.target.value }))} className="input-field" placeholder="MM/YY" maxLength={5} />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">CVC</label>
                    <input value={card.cvc} onChange={e => setCard(c => ({ ...c, cvc: e.target.value }))} className="input-field" placeholder="123" maxLength={4} />
                  </div>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={() => setStep('shipping')} className="btn-secondary">Back</button>
                <button onClick={placeOrder} disabled={processing} className="btn-primary flex-1">
                  {processing ? 'Processing...' : `Pay ${formatPrice(grandTotal)}`}
                </button>
              </div>
              <p className="text-xs text-gray-400 mt-3 text-center">This is a demo — no real payment is processed.</p>
            </div>
          )}
        </div>

        {/* Order summary */}
        <div className="lg:col-span-1">
          <div className="card p-6 sticky top-20">
            <h2 className="font-bold text-lg mb-4">Order Summary</h2>
            <div className="space-y-3 max-h-48 overflow-y-auto mb-4">
              {items.map(item => (
                <div key={item.id} className="flex gap-3 text-sm">
                  <div className="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                    <img src={item.products?.images?.[0]} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{item.products?.name}</p>
                    <p className="text-gray-400">Qty: {item.quantity}</p>
                  </div>
                  <span className="font-semibold">{formatPrice((item.products?.price ?? 0) * item.quantity)}</span>
                </div>
              ))}
            </div>
            <div className="space-y-2 text-sm border-t border-gray-100 pt-3">
              <div className="flex justify-between"><span className="text-gray-600">Subtotal</span><span>{formatPrice(total)}</span></div>
              <div className="flex justify-between"><span className="text-gray-600">Shipping</span><span>{shipping === 0 ? 'FREE' : formatPrice(shipping)}</span></div>
              <div className="flex justify-between"><span className="text-gray-600">Tax</span><span>{formatPrice(tax)}</span></div>
              <div className="flex justify-between font-bold text-lg border-t border-gray-100 pt-2"><span>Total</span><span>{formatPrice(grandTotal)}</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
