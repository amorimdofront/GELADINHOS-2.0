import { useEffect } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import Router from './Router';
import CartModal from './components/CartModal';

function App() {
  useEffect(() => {
    const existingSessionId = localStorage.getItem('sessionId');
    if (!existingSessionId) {
      const newSessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('sessionId', newSessionId);
    }
  }, []);

  return (
    <AuthProvider>
      <CartProvider>
        <Router />
        <CartModal />
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
