import { useEffect, useState } from 'react';
import { supabase, Sale, Product } from '../../lib/supabase';
import { Plus, Edit2, Trash2, X, TrendingUp } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export default function SalesManager() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingSale, setEditingSale] = useState<Sale | null>(null);
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    product_id: '',
    quantity: '',
    unit_price: '',
    date: new Date().toISOString().split('T')[0],
    notes: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const [salesResult, productsResult] = await Promise.all([
      supabase.from('sales').select('*, products(*)').order('date', { ascending: false }),
      supabase.from('products').select('*').eq('is_active', true)
    ]);

    if (salesResult.data) setSales(salesResult.data);
    if (productsResult.data) setProducts(productsResult.data);
    setLoading(false);
  };

  const handleProductChange = (productId: string) => {
    const product = products.find(p => p.id === productId);
    if (product) {
      setFormData({ ...formData, product_id: productId, unit_price: product.price.toString() });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const quantity = parseInt(formData.quantity);
    const unitPrice = parseFloat(formData.unit_price);
    const totalAmount = quantity * unitPrice;

    if (editingSale) {
      await supabase
        .from('sales')
        .update({
          product_id: formData.product_id,
          quantity,
          unit_price: unitPrice,
          total_amount: totalAmount,
          date: formData.date,
          notes: formData.notes || null
        })
        .eq('id', editingSale.id);
    } else {
      await supabase
        .from('sales')
        .insert([{
          product_id: formData.product_id,
          quantity,
          unit_price: unitPrice,
          total_amount: totalAmount,
          date: formData.date,
          notes: formData.notes || null,
          created_by: user?.id
        }]);
    }

    resetForm();
    fetchData();
  };

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta venda?')) {
      await supabase.from('sales').delete().eq('id', id);
      fetchData();
    }
  };

  const resetForm = () => {
    setFormData({
      product_id: '',
      quantity: '',
      unit_price: '',
      date: new Date().toISOString().split('T')[0],
      notes: ''
    });
    setEditingSale(null);
    setShowModal(false);
  };

  const openEditModal = (sale: Sale) => {
    setEditingSale(sale);
    setFormData({
      product_id: sale.product_id,
      quantity: sale.quantity.toString(),
      unit_price: sale.unit_price.toString(),
      date: sale.date,
      notes: sale.notes || ''
    });
    setShowModal(true);
  };

  const salesByProduct = products.map(product => {
    const productSales = sales.filter(s => s.product_id === product.id);
    const totalQty = productSales.reduce((sum, s) => sum + s.quantity, 0);
    const totalRevenue = productSales.reduce((sum, s) => sum + s.total_amount, 0);
    return { product, totalQty, totalRevenue };
  }).filter(item => item.totalQty > 0).sort((a, b) => b.totalRevenue - a.totalRevenue);

  const totalSalesRevenue = sales.reduce((sum, s) => sum + s.total_amount, 0);
  const totalSalesQty = sales.reduce((sum, s) => sum + s.quantity, 0);
  const avgTicket = totalSalesQty > 0 ? totalSalesRevenue / totalSalesQty : 0;

  if (loading) {
    return <div className="text-center py-12">Carregando...</div>;
  }

  return (
    <div>
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-8 space-y-4 md:space-y-0">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Vendas por Produto</h2>
          <p className="text-gray-600 mt-1">Rastreie quais produtos estão vendendo mais</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-500 text-white rounded-lg hover:shadow-lg transition-all duration-300"
        >
          <Plus className="w-5 h-5" />
          <span>Nova Venda</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gradient-to-br from-blue-500 to-cyan-400 rounded-2xl p-6 text-white shadow-lg">
          <p className="text-sm opacity-90 mb-2">Receita Total (Vendas)</p>
          <p className="text-3xl font-bold">R$ {totalSalesRevenue.toFixed(2)}</p>
          <p className="text-xs opacity-75 mt-2">{totalSalesQty} unidades vendidas</p>
        </div>
        <div className="bg-gradient-to-br from-purple-500 to-pink-400 rounded-2xl p-6 text-white shadow-lg">
          <p className="text-sm opacity-90 mb-2">Ticket Médio</p>
          <p className="text-3xl font-bold">R$ {avgTicket.toFixed(2)}</p>
          <p className="text-xs opacity-75 mt-2">Por unidade</p>
        </div>
        <div className="bg-gradient-to-br from-orange-500 to-yellow-400 rounded-2xl p-6 text-white shadow-lg">
          <p className="text-sm opacity-90 mb-2">Produtos Vendidos</p>
          <p className="text-3xl font-bold">{salesByProduct.length}</p>
          <p className="text-xs opacity-75 mt-2">De {products.length} disponíveis</p>
        </div>
      </div>

      {salesByProduct.length > 0 && (
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex items-center space-x-2 mb-6">
            <TrendingUp className="w-5 h-5 text-green-600" />
            <h3 className="text-xl font-bold text-gray-800">Top Produtos</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {salesByProduct.slice(0, 6).map((item, index) => (
              <div key={item.product.id} className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 border border-gray-200">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="text-xs text-gray-600 mb-1">#{index + 1}</p>
                    <h4 className="font-bold text-gray-800">{item.product.name}</h4>
                  </div>
                  <span className="text-2xl font-bold text-green-600">{item.totalQty}</span>
                </div>
                <div className="border-t border-gray-200 pt-3">
                  <p className="text-sm text-gray-600 mb-1">Receita:</p>
                  <p className="text-lg font-bold text-gray-800">R$ {item.totalRevenue.toFixed(2)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-6">Todas as Vendas</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Data</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Produto</th>
                <th className="text-center py-3 px-4 text-sm font-semibold text-gray-600">Qtd</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-600">Preço Unit.</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-600">Total</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Notas</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-600">Ações</th>
              </tr>
            </thead>
            <tbody>
              {sales.map((sale) => (
                <tr key={sale.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors duration-200">
                  <td className="py-3 px-4 text-sm text-gray-800">
                    {new Date(sale.date).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="py-3 px-4 text-sm">
                    <div className="font-medium text-gray-800">{sale.products?.name}</div>
                    <div className="text-xs text-gray-500">{sale.products?.category}</div>
                  </td>
                  <td className="py-3 px-4 text-sm text-center font-semibold text-gray-800">
                    {sale.quantity}
                  </td>
                  <td className="py-3 px-4 text-sm text-right text-gray-800">
                    R$ {sale.unit_price.toFixed(2)}
                  </td>
                  <td className="py-3 px-4 text-sm text-right font-bold text-green-600">
                    R$ {sale.total_amount.toFixed(2)}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600">
                    {sale.notes && <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">{sale.notes}</span>}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => openEditModal(sale)}
                      className="text-blue-600 hover:text-blue-800 mr-3 transition-colors duration-300"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(sale.id)}
                      className="text-red-600 hover:text-red-800 transition-colors duration-300"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {sales.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              Nenhuma venda registrada ainda
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
            <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h3 className="text-2xl font-bold text-gray-800">
                {editingSale ? 'Editar Venda' : 'Nova Venda'}
              </h3>
              <button
                onClick={resetForm}
                className="text-gray-400 hover:text-gray-600 transition-colors duration-300"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Produto</label>
                <select
                  value={formData.product_id}
                  onChange={(e) => handleProductChange(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                >
                  <option value="">Selecione um produto</option>
                  {products.map(product => (
                    <option key={product.id} value={product.id}>
                      {product.name} - R$ {product.price.toFixed(2)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Quantidade</label>
                <input
                  type="number"
                  min="1"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Preço Unit. (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.unit_price}
                    onChange={(e) => setFormData({ ...formData, unit_price: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Data</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Notas (Opcional)</label>
                <input
                  type="text"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Ex: Promoção, Lote especial..."
                />
              </div>

              {formData.quantity && formData.unit_price && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <p className="text-sm text-gray-700 mb-1">Total da venda:</p>
                  <p className="text-2xl font-bold text-green-600">
                    R$ {(parseInt(formData.quantity) * parseFloat(formData.unit_price || '0')).toFixed(2)}
                  </p>
                </div>
              )}

              <div className="flex space-x-4 pt-4">
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-300"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-500 text-white rounded-lg hover:shadow-lg transition-all duration-300"
                >
                  {editingSale ? 'Atualizar' : 'Registrar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
