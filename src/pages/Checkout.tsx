import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase, CartItem, Product, Order, OrderItem } from '../lib/supabase';
import { ArrowLeft, MapPin, Phone, User } from 'lucide-react';

const DELIVERY_FEE = 3;
const WHATSAPP_NUMBER = '71999784507';

export default function Checkout() {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState<(CartItem & { products: Product })[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [sessionId] = useState(() => localStorage.getItem('sessionId') || '');

  const [formData, setFormData] = useState({
    customerName: '',
    customerPhone: '',
    deliveryOption: 'pickup' as 'pickup' | 'delivery',
    deliveryAddress: '',
    deliveryCep: '',
    deliveryNeighborhood: '',
    orderNotes: ''
  });

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

  const subtotal = cartItems.reduce((sum, item) => sum + (item.products.price * item.quantity), 0);
  const deliveryFee = formData.deliveryOption === 'delivery' ? DELIVERY_FEE : 0;
  const total = subtotal + deliveryFee;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const generateWhatsAppMessage = () => {
    const itemsList = cartItems
      .map(item => `• ${item.products.name} (${item.quantity}x) - R$ ${(item.products.price * item.quantity).toFixed(2)}`)
      .join('\n');

    const deliveryInfo = formData.deliveryOption === 'delivery'
      ? `\n📍 *Entrega:*\nCEP: ${formData.deliveryCep}\nEndereço: ${formData.deliveryAddress}\nBairro: ${formData.deliveryNeighborhood}\nFrete: R$ ${deliveryFee.toFixed(2)}`
      : '\n📍 *Retirada Sem Custo*';

    const message = `Olá! Gostaria de fazer um pedido:\n\n👤 *Cliente:* ${formData.customerName}\n📱 *Telefone:* ${formData.customerPhone}\n\n🛒 *Produtos:*\n${itemsList}\n${deliveryInfo}\n\n💰 *Subtotal:* R$ ${subtotal.toFixed(2)}\n💰 *Total:* R$ ${total.toFixed(2)}${formData.orderNotes ? `\n\n📝 *Observações:* ${formData.orderNotes}` : ''}\n\nObrigado!`;

    return message;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    if (!formData.customerName || !formData.customerPhone) {
      alert('Por favor, preencha nome e telefone');
      setSubmitting(false);
      return;
    }

    if (formData.deliveryOption === 'delivery' && (!formData.deliveryCep || !formData.deliveryAddress || !formData.deliveryNeighborhood)) {
      alert('Por favor, preencha CEP, endereço e bairro para entrega');
      setSubmitting(false);
      return;
    }

    const orderData = {
      customer_name: formData.customerName,
      customer_phone: formData.customerPhone,
      delivery_option: formData.deliveryOption,
      delivery_address: formData.deliveryOption === 'delivery' ? formData.deliveryAddress : null,
      delivery_cep: formData.deliveryOption === 'delivery' ? formData.deliveryCep : null,
      delivery_neighborhood: formData.deliveryOption === 'delivery' ? formData.deliveryNeighborhood : null,
      subtotal,
      delivery_fee: deliveryFee,
      total,
      order_notes: formData.orderNotes || null,
      status: 'pending',
      whatsapp_sent: false
    };

    const { data: orderResult, error: orderError } = await supabase
      .from('orders')
      .insert([orderData])
      .select()
      .maybeSingle();

    if (orderError || !orderResult) {
      alert('Erro ao criar pedido');
      setSubmitting(false);
      return;
    }

    const orderItemsData = cartItems.map(item => ({
      order_id: orderResult.id,
      product_id: item.product_id,
      product_name: item.products.name,
      quantity: item.quantity,
      unit_price: item.products.price,
      total_price: item.products.price * item.quantity
    }));

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItemsData);

    if (itemsError) {
      alert('Erro ao salvar itens do pedido');
      setSubmitting(false);
      return;
    }

    await supabase
      .from('orders')
      .update({ whatsapp_sent: true })
      .eq('id', orderResult.id);

    const whatsappMessage = generateWhatsAppMessage();
    const encodedMessage = encodeURIComponent(whatsappMessage);
    const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`;

    await supabase
      .from('cart_items')
      .delete()
      .eq('session_id', sessionId);

    setSubmitting(false);
    window.location.href = whatsappUrl;
  };

  if (loading) {
    return <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 py-12">Carregando...</div>;
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 py-12">
        <div className="container mx-auto px-4">
          <button
            onClick={() => navigate('/cart')}
            className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 font-medium mb-8"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Voltar</span>
          </button>
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center max-w-2xl mx-auto">
            <p className="text-xl text-gray-600">Seu carrinho está vazio</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 py-12">
      <div className="container mx-auto px-4 sm:px-6">
        <button
          onClick={() => navigate('/cart')}
          className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 font-medium mb-8 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Voltar ao Carrinho</span>
        </button>

        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-bold text-gray-800 mb-8">Finalizar Pedido</h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <form onSubmit={handleSubmit} className="lg:col-span-2 space-y-8">
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center space-x-2">
                  <User className="w-6 h-6 text-blue-600" />
                  <span>Dados Pessoais</span>
                </h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Nome Completo *</label>
                    <input
                      type="text"
                      name="customerName"
                      value={formData.customerName}
                      onChange={handleInputChange}
                      placeholder="Seu nome"
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Telefone/WhatsApp *</label>
                    <input
                      type="tel"
                      name="customerPhone"
                      value={formData.customerPhone}
                      onChange={handleInputChange}
                      placeholder="(71) 99999-9999"
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-lg p-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center space-x-2">
                  <MapPin className="w-6 h-6 text-blue-600" />
                  <span>Forma de Entrega</span>
                </h2>

                <div className="space-y-4">
                  <label className="flex items-center p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-blue-500 transition-colors"
                    style={{ borderColor: formData.deliveryOption === 'pickup' ? '#0066cc' : '' }}>
                    <input
                      type="radio"
                      name="deliveryOption"
                      value="pickup"
                      checked={formData.deliveryOption === 'pickup'}
                      onChange={handleInputChange}
                      className="w-5 h-5"
                    />
                    <div className="ml-4 flex-1">
                      <p className="font-semibold text-gray-800">Retirada na Loja</p>
                      <p className="text-sm text-green-600 font-bold">Sem Custo</p>
                    </div>
                  </label>

                  <label className="flex items-center p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-blue-500 transition-colors"
                    style={{ borderColor: formData.deliveryOption === 'delivery' ? '#0066cc' : '' }}>
                    <input
                      type="radio"
                      name="deliveryOption"
                      value="delivery"
                      checked={formData.deliveryOption === 'delivery'}
                      onChange={handleInputChange}
                      className="w-5 h-5"
                    />
                    <div className="ml-4 flex-1">
                      <p className="font-semibold text-gray-800">Entrega - Bairro da Paz</p>
                      <p className="text-sm text-orange-600 font-bold">R$ 3,00</p>
                    </div>
                  </label>
                </div>

                {formData.deliveryOption === 'delivery' && (
                  <div className="mt-6 pt-6 border-t border-gray-200 space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">CEP *</label>
                      <input
                        type="text"
                        name="deliveryCep"
                        value={formData.deliveryCep}
                        onChange={handleInputChange}
                        placeholder="00000-000"
                        required={formData.deliveryOption === 'delivery'}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Endereço *</label>
                      <input
                        type="text"
                        name="deliveryAddress"
                        value={formData.deliveryAddress}
                        onChange={handleInputChange}
                        placeholder="Rua, número, complemento"
                        required={formData.deliveryOption === 'delivery'}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Bairro *</label>
                      <input
                        type="text"
                        name="deliveryNeighborhood"
                        value={formData.deliveryNeighborhood}
                        onChange={handleInputChange}
                        placeholder="Nome do bairro"
                        required={formData.deliveryOption === 'delivery'}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="bg-white rounded-2xl shadow-lg p-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Observações (Opcional)</h2>
                <textarea
                  name="orderNotes"
                  value={formData.orderNotes}
                  onChange={handleInputChange}
                  placeholder="Deixe alguma observação ou pedido especial..."
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </form>

            <div>
              <div className="bg-white rounded-2xl shadow-lg p-8 sticky top-24">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Resumo do Pedido</h2>

                <div className="space-y-3 mb-6 pb-6 border-b border-gray-200">
                  {cartItems.map(item => (
                    <div key={item.id} className="flex justify-between text-gray-700">
                      <span>{item.products.name} x{item.quantity}</span>
                      <span className="font-semibold">R$ {(item.products.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                <div className="space-y-3 mb-6 pb-6 border-b border-gray-200">
                  <div className="flex justify-between text-gray-700">
                    <span>Subtotal</span>
                    <span className="font-semibold">R$ {subtotal.toFixed(2)}</span>
                  </div>
                  {deliveryFee > 0 && (
                    <div className="flex justify-between text-gray-700">
                      <span>Frete (Bairro da Paz)</span>
                      <span className="font-semibold text-orange-600">R$ {deliveryFee.toFixed(2)}</span>
                    </div>
                  )}
                </div>

                <div className="flex justify-between items-center mb-8">
                  <span className="text-lg font-bold text-gray-800">Total</span>
                  <span className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
                    R$ {total.toFixed(2)}
                  </span>
                </div>

                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="w-full py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:shadow-lg transition-all duration-300 font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  <Phone className="w-5 h-5" />
                  <span>{submitting ? 'Processando...' : 'Finalizar no WhatsApp'}</span>
                </button>

                <p className="text-xs text-gray-500 text-center mt-4">
                  Você será redirecionado para o WhatsApp com seu pedido
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
