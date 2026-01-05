import { useEffect, useState } from 'react';
import { supabase, CartItem, Product } from '../lib/supabase';
import { Trash2, Plus, Minus, X } from 'lucide-react';
import { useCart } from '../contexts/CartContext';

export default function CartModal() {
  const { isOpen, closeCart } = useCart();
  const [cartItems, setCartItems] = useState<(CartItem & { products: Product })[]>([]);
  const [loading, setLoading] = useState(true);
  const [sessionId] = useState(() => localStorage.getItem('sessionId') || '');

  useEffect(() => {
    if (isOpen && sessionId) {
      fetchCart();
    }
  }, [isOpen, sessionId]);

  const fetchCart = async () => {
    if (!sessionId) {
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from('cart_items')
      .select('*, products(*)')
      .eq('session_id', sessionId);

    if (!error && data) {
      setCartItems(data as any);
    }
    setLoading(false);
  };

  const updateQuantity = async (cartItemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(cartItemId);
      return;
    }

    await supabase
      .from('cart_items')
      .update({ quantity: newQuantity })
      .eq('id', cartItemId);

    fetchCart();
  };

  const removeFromCart = async (cartItemId: string) => {
    await supabase
      .from('cart_items')
      .delete()
      .eq('id', cartItemId);

    fetchCart();
  };

  const clearCart = async () => {
    await supabase
      .from('cart_items')
      .delete()
      .eq('session_id', sessionId);

    setCartItems([]);
  };

  const goToCheckout = () => {
    closeCart();
    window.location.href = '/checkout';
  };

  const subtotal = cartItems.reduce((sum, item) => sum + (item.products.price * item.quantity), 0);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" onClick={closeCart}></div>

      <div className="absolute right-0 top-0 bottom-0 w-full max-w-md bg-white shadow-2xl flex flex-col animate-slide-in-right">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800">Seu Carrinho</h2>
          <button
            onClick={closeCart}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        {loading ? (
          <div className="flex-1 flex items-center justify-center text-gray-600">
            Carregando...
          </div>
        ) : cartItems.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
            <p className="text-lg text-gray-600 mb-4">Seu carrinho está vazio</p>
            <button
              onClick={closeCart}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Continuar Comprando
            </button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {cartItems.map((item) => (
                <div key={item.id} className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors">
                  <div className="flex gap-3 mb-3">
                    <img
                      src={item.products.image_url}
                      alt={item.products.name}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-gray-800 truncate">{item.products.name}</h3>
                      <p className="text-sm text-gray-600">{item.products.category}</p>
                      <p className="font-bold text-blue-600 mt-1">R$ {item.products.price.toFixed(2)}</p>
                    </div>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="text-red-500 hover:text-red-700 transition-colors flex-shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 bg-white rounded-lg p-1 border border-gray-200">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="p-1 hover:bg-gray-100 rounded transition-colors"
                      >
                        <Minus className="w-3 h-3 text-gray-700" />
                      </button>
                      <span className="w-5 text-center text-sm font-bold text-gray-800">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="p-1 hover:bg-gray-100 rounded transition-colors"
                      >
                        <Plus className="w-3 h-3 text-gray-700" />
                      </button>
                    </div>
                    <p className="font-bold text-gray-800 text-sm">
                      R$ {(item.products.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-200 p-6 space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-gray-700">
                  <span>Subtotal ({cartItems.reduce((sum, item) => sum + item.quantity, 0)} itens)</span>
                  <span className="font-semibold">R$ {subtotal.toFixed(2)}</span>
                </div>
              </div>

              <button
                onClick={goToCheckout}
                className="w-full py-3 bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-lg hover:shadow-lg transition-all duration-300 font-bold"
              >
                Ir para Checkout
              </button>

              <button
                onClick={clearCart}
                className="w-full py-2 text-red-600 hover:text-red-700 font-medium transition-colors"
              >
                Limpar Carrinho
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
