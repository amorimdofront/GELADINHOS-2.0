import { useEffect, useState } from 'react';
import { supabase, Product, ProductInventory } from '../../lib/supabase';
import { RefreshCw, Edit2, Save, X } from 'lucide-react';

interface InventoryItem extends ProductInventory {
  products: Product | null;
}

export default function InventoryManager() {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<Partial<ProductInventory>>({});

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    const { data, error } = await supabase
      .from('product_inventory')
      .select('*, products(*)')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setInventory(data);
    }
    setLoading(false);
  };

  const handleEdit = (item: InventoryItem) => {
    setEditingId(item.id);
    setEditValues({
      quantity_available: item.quantity_available,
      reorder_level: item.reorder_level,
    });
  };

  const handleSave = async (id: string) => {
    const { error } = await supabase
      .from('product_inventory')
      .update({
        quantity_available: editValues.quantity_available,
        reorder_level: editValues.reorder_level,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (!error) {
      setEditingId(null);
      fetchInventory();
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditValues({});
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-8">
        <div className="text-center text-gray-500">Carregando inventário...</div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <div className="p-6 border-b border-gray-200 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">Gerenciar Inventário</h2>
        <button
          onClick={fetchInventory}
          className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-300"
        >
          <RefreshCw className="w-5 h-5" />
          <span>Atualizar</span>
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Produto</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Disponível</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Vendido</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Nível Mínimo</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Última Reposição</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Ações</th>
            </tr>
          </thead>
          <tbody>
            {inventory.map((item) => (
              <tr key={item.id} className="border-b border-gray-200 hover:bg-gray-50 transition-colors duration-300">
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-3">
                    {item.products?.image_url && (
                      <img src={item.products.image_url} alt={item.products.name} className="w-10 h-10 rounded-lg object-cover" />
                    )}
                    <div>
                      <p className="font-medium text-gray-800">{item.products?.name}</p>
                      <p className="text-sm text-gray-500">{item.products?.category}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  {editingId === item.id ? (
                    <input
                      type="number"
                      value={editValues.quantity_available || 0}
                      onChange={(e) =>
                        setEditValues({
                          ...editValues,
                          quantity_available: parseInt(e.target.value),
                        })
                      }
                      className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <span
                      className={`inline-block px-3 py-1 rounded-lg font-medium ${
                        item.quantity_available <= item.reorder_level
                          ? 'bg-red-100 text-red-700'
                          : 'bg-green-100 text-green-700'
                      }`}
                    >
                      {item.quantity_available}
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 text-gray-700">{item.quantity_sold}</td>
                <td className="px-6 py-4">
                  {editingId === item.id ? (
                    <input
                      type="number"
                      value={editValues.reorder_level || 0}
                      onChange={(e) =>
                        setEditValues({
                          ...editValues,
                          reorder_level: parseInt(e.target.value),
                        })
                      }
                      className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <span className="text-gray-700">{item.reorder_level}</span>
                  )}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {new Date(item.last_restocked).toLocaleDateString('pt-BR')}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-2">
                    {editingId === item.id ? (
                      <>
                        <button
                          onClick={() => handleSave(item.id)}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors duration-300"
                          title="Salvar"
                        >
                          <Save className="w-5 h-5" />
                        </button>
                        <button
                          onClick={handleCancel}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-300"
                          title="Cancelar"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => handleEdit(item)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-300"
                        title="Editar"
                      >
                        <Edit2 className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {inventory.length === 0 && (
        <div className="p-8 text-center text-gray-500">
          Nenhum inventário registrado ainda.
        </div>
      )}
    </div>
  );
}
