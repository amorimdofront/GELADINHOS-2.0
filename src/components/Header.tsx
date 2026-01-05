import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { IceCream, ShoppingBag } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useCart } from '../contexts/CartContext';

export default function Header() {
  const navigate = useNavigate();
  const { openCart } = useCart();
  const [cartCount, setCartCount] = useState(0);
  const [sessionId] = useState(() => localStorage.getItem('sessionId') || '');

  useEffect(() => {
    if (sessionId) {
      fetchCartCount();
      const subscription = supabase
        .channel(`cart_${sessionId}`)
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'cart_items', filter: `session_id=eq.${sessionId}` },
          () => fetchCartCount()
        )
        .subscribe();

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [sessionId]);

  const fetchCartCount = async () => {
    if (!sessionId) return;
    const { data, error } = await supabase
      .from('cart_items')
      .select('id', { count: 'exact', head: true })
      .eq('session_id', sessionId);

    if (!error && data) {
      setCartCount(data.length || 0);
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 transition-all duration-300 bg-white/80 backdrop-blur-md border-b border-gray-200">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <button onClick={() => navigate('/')} className="flex items-center space-x-3 group cursor-pointer">
            <div className="bg-gradient-to-br from-blue-500 to-cyan-400 p-2 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
              <IceCream className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
                Geladinhos Amorim
              </h1>
              <p className="text-xs text-gray-600">Sabor que refresca</p>
            </div>
          </button>

          <nav className="hidden md:flex items-center space-x-8">
            <a href="#home" className="text-gray-700 hover:text-blue-600 transition-colors duration-300 font-medium">
              Início
            </a>
            <a href="#products" className="text-gray-700 hover:text-blue-600 transition-colors duration-300 font-medium">
              Produtos
            </a>
            <a href="#about" className="text-gray-700 hover:text-blue-600 transition-colors duration-300 font-medium">
              Sobre
            </a>
            <a href="#contact" className="text-gray-700 hover:text-blue-600 transition-colors duration-300 font-medium">
              Contato
            </a>
          </nav>

          <button
            onClick={openCart}
            className="relative p-3 rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 text-white hover:shadow-lg transition-all duration-300"
          >
            <ShoppingBag className="w-6 h-6" />
            {cartCount > 0 && (
              <div className="absolute top-0 right-0 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-xs font-bold text-white">
                {cartCount > 9 ? '9+' : cartCount}
              </div>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
