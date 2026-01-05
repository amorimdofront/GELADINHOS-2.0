import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase, CartItem, Product } from '../lib/supabase';
import { Trash2, Plus, Minus, ArrowLeft } from 'lucide-react';

export default function Cart() {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState<(CartItem & { products: Product })[]>([]);
  const [loading, setLoading] = useState(true);
  const [sessionId] = useState(() => localStorage.getItem('sessionId') || '');

  useEffect(() => {
    fetchCart();
  }, [sessionId]);

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

    const { error } = await supabase
      .from('cart_items')
      .update({ quantity: newQuantity })
      .eq('id', cartItemId);

    if (!error) {
      fetchCart();
    }
  };

  const removeFromCart = async (cartItemId: string) => {
    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('id', cartItemId);

    if (!error) {
      fetchCart();
    }
  };

  const clearCart = async () => {
    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('session_id', sessionId);

    if (!error) {
      setCartItems([]);
    }
  };

  const subtotal = cartItems.reduce((sum, item) => sum + (item.products.price * item.quantity), 0);

  if (loading) {
    return <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 py-12">Carregando...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 py-12">
      <div className="container mx-auto px-4 sm:px-6">
        <button
          onClick={() => navigate('/')}
          className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 font-medium mb-8 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Voltar</span>
        </button>

        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-bold text-gray-800 mb-8">Seu Carrinho</h1>

          {cartItems.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
              <p className="text-xl text-gray-600 mb-6">Seu carrinho está vazio</p>
              <button
                onClick={() => navigate('/#products')}
                className="px-8 py-3 bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-lg hover:shadow-lg transition-all duration-300 font-semibold"
              >
                Continuar Comprando
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <div className="space-y-4">
                  {cartItems.map((item) => (
                    <div key={item.id} className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
                      <div className="flex gap-6">
                        <img
                          src={item.products.image_url}
                          alt={item.products.name}
                          className="w-24 h-24 object-cover rounded-lg"
                        />
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-gray-800">{item.products.name}</h3>
                          <p className="text-gray-600 text-sm mt-1">{item.products.category}</p>
                          <p className="text-2xl font-bold text-blue-600 mt-3">R$ {item.products.price.toFixed(2)}</p>
                        </div>

                        <div className="flex flex-col items-end justify-between">
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="text-red-500 hover:text-red-700 transition-colors"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>

                          <div className="flex items-center space-x-3 bg-gray-100 rounded-lg p-2">
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="p-1 hover:bg-gray-200 rounded transition-colors"
                            >
                              <Minus className="w-4 h-4 text-gray-700" />
                            </button>
                            <span className="w-6 text-center font-bold text-gray-800">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="p-1 hover:bg-gray-200 rounded transition-colors"
                            >
                              <Plus className="w-4 h-4 text-gray-700" />
                            </button>
                          </div>

                          <p className="font-bold text-gray-800">
                            R$ {(item.products.price * item.quantity).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  onClick={clearCart}
                  className="mt-6 text-red-600 hover:text-red-700 font-medium transition-colors"
                >
                  Limpar Carrinho
                </button>
              </div>

              <div>
                <div className="bg-white rounded-2xl shadow-lg p-8 sticky top-24">
                  <h2 className="text-2xl font-bold text-gray-800 mb-6">Resumo</h2>

                  <div className="space-y-4 mb-8 pb-8 border-b border-gray-200">
                    <div className="flex justify-between text-gray-700">
                      <span>Subtotal ({cartItems.reduce((sum, item) => sum + item.quantity, 0)} itens)</span>
                      <span className="font-semibold">R$ {subtotal.toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="text-center">
                    <p className="text-gray-600 text-sm mb-4">Escolha a forma de entrega no próximo passo</p>
                    <button
                      onClick={() => navigate('/checkout')}
                      className="w-full py-3 bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-lg hover:shadow-lg transition-all duration-300 font-bold text-lg"
                    >
                      Ir para Checkout
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
