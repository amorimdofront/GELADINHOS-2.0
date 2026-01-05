import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { CheckCircle, XCircle, Trash2, Gift, Clock, AlertTriangle } from 'lucide-react';

interface Order {
  id: string;
  customer_name: string;
  customer_phone: string;
  total: number;
  status: string;
  created_at: string;
  items_summary?: string;
  total_quantity?: number;
}

interface CustomerPurchase {
  id: string;
  phone_number: string;
  customer_name: string;
  total_quantity: number;
  promotion_won: boolean;
  last_purchase_date?: string;
  created_at: string; // Adicionado para saber a 1ª compra
}

export default function OrdersManager() {
  const [activeTab, setActiveTab] = useState<'orders' | 'loyalty'>('orders');
  const [orders, setOrders] = useState<Order[]>([]);
  const [customers, setCustomers] = useState<CustomerPurchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending');

  useEffect(() => {
    if (activeTab === 'orders') fetchOrders();
    else fetchCustomers();
  }, [activeTab, filter]);

  // --- 1. BUSCA DE PEDIDOS ---
  const fetchOrders = async () => {
    setLoading(true);
    try {
        let query = supabase.from('orders').select('*').order('created_at', { ascending: false });
        
        if (filter === 'pending') query = query.in('status', ['pending']);
        if (filter === 'approved') query = query.in('status', ['approved']);
        if (filter === 'rejected') query = query.in('status', ['rejected']);

        const { data: ordersData, error } = await query;
        if (error) { console.error(error); return; }
        if (!ordersData) { setOrders([]); return; }

        const orderIds = ordersData.map(o => o.id);
        const { data: itemsData } = await supabase.from('order_items').select('*').in('order_id', orderIds);

        const enriched = ordersData.map(order => {
            const myItems = itemsData?.filter(i => i.order_id === order.id) || [];
            const summary = myItems.map(i => `${i.product_name} (x${i.quantity})`).join(', ');
            const totalQty = myItems.reduce((acc, i) => acc + (i.quantity || 1), 0);
            
            return {
                ...order,
                customer_phone: order.customer_phone || order.phone_number || order.phone || '',
                total: Number(order.total || order.total_amount || 0),
                items_summary: summary,
                total_quantity: totalQty > 0 ? totalQty : 1
            };
        });
        setOrders(enriched);
    } catch (e) {
        console.error(e);
    } finally {
        setLoading(false);
    }
  };

  // --- 2. LISTAGEM DE CLIENTES FIDELIDADE ---
  const fetchCustomers = async () => {
    setLoading(true);
    // Trazendo created_at para saber quando começou o ciclo
    const { data, error } = await supabase
        .from('whatsapp_customer_purchases')
        .select('*')
        .order('last_purchase_date', { ascending: false });

    if (error) alert("Erro ao carregar lista de fidelidade: " + error.message);
    else setCustomers(data || []);
    setLoading(false);
  };

  // --- 3. APROVAÇÃO DO PEDIDO ---
  const handleApprove = async (orderId: string) => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    const phone = order.customer_phone;
    if (!phone || phone.length < 8) {
        alert("ERRO: O telefone está vazio ou inválido.");
        return;
    }

    try {
        const { error: errOrder } = await supabase.from('orders').update({ status: 'approved' }).eq('id', orderId);
        if (errOrder) throw new Error(errOrder.message);

        await updateLoyalty(order, phone);
        
        alert("Pedido aprovado e pontos computados!");
        fetchOrders();
    } catch (error: any) {
        alert(`ERRO: ${error.message}`);
    }
  };

  // --- 4. ATUALIZAÇÃO DOS PONTOS ---
  const updateLoyalty = async (order: Order, phone: string) => {
    const qtd = order.total_quantity || 1;

    const { data: existing, error: searchError } = await supabase
      .from('whatsapp_customer_purchases') 
      .select('*')
      .eq('phone_number', phone)
      .maybeSingle();

    if (searchError) throw new Error(searchError.message);

    if (existing) {
      // Verificação rápida: Se já estiver expirado, deve avisar? 
      // Por enquanto, soma os pontos, mas o Admin verá que está expirado na tabela.
      const newTotal = existing.total_quantity + qtd;
      
      const { error: updateError } = await supabase
        .from('whatsapp_customer_purchases')
        .update({
          total_quantity: newTotal,
          promotion_won: newTotal >= 20,
          last_purchase_date: new Date().toISOString()
        })
        .eq('phone_number', phone);

      if (updateError) throw new Error(updateError.message);

    } else {
      const { error: insertError } = await supabase
        .from('whatsapp_customer_purchases')
        .insert({
          phone_number: phone,
          customer_name: order.customer_name,
          total_quantity: qtd,
          promotion_won: qtd >= 20,
          last_purchase_date: new Date().toISOString(),
          // created_at é gerado automático pelo Supabase, marcando o início do ciclo
        });

      if (insertError) throw new Error(insertError.message);
    }
  };

  // --- 5. ENTREGAR PRÊMIO (FINALIZAR CICLO) ---
  const handleRedeemReward = async (phone: string, name: string) => {
    if (!confirm(`Confirmar entrega do prêmio para ${name}? Isso irá reiniciar o ciclo.`)) return;
    
    // Para reiniciar a DATA DE INÍCIO, precisamos deletar o registro antigo.
    // Assim, na próxima compra, cria-se um novo com data de hoje.
    await resetCycle(phone, "Prêmio entregue! Ciclo reiniciado.");
  };

  // --- 6. REINICIAR CICLO (PARA EXPIRADOS) ---
  const handleResetCycle = async (phone: string, name: string) => {
    if (!confirm(`O prazo de ${name} expirou. Deseja zerar os pontos e reiniciar a data?`)) return;
    await resetCycle(phone, "Ciclo reiniciado (Expirado).");
  };

  const resetCycle = async (phone: string, successMessage: string) => {
    try {
        // Deletamos o registro. A próxima compra criará um novo com created_at atualizado.
        const { error } = await supabase
          .from('whatsapp_customer_purchases')
          .delete()
          .eq('phone_number', phone);
  
        if (error) throw error;
  
        alert(successMessage);
        fetchCustomers();
      } catch (error: any) {
        alert("Erro ao reiniciar ciclo: " + error.message);
      }
  }

  // --- HELPERS ---
  const handleReject = async (id: string) => {
    await supabase.from('orders').update({ status: 'rejected' }).eq('id', id);
    fetchOrders();
  };
  
  const handleDelete = async (id: string) => {
    if(confirm("Tem certeza?")) {
        await supabase.from('orders').delete().eq('id', id);
        fetchOrders();
    }
  };

  const getBadge = (status: string) => {
    const s = status.toLowerCase();
    if(s.includes('pend')) return <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs font-bold">Pendente</span>;
    if(s.includes('appro')) return <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-bold">Aprovado</span>;
    return <span className="px-2 py-1 bg-red-100 text-red-800 rounded text-xs font-bold">Rejeitado</span>;
  };

  // --- RENDERIZAÇÃO ---
  return (
    <div className="space-y-6">
      <div className="flex gap-4 border-b pb-2">
        <button onClick={() => setActiveTab('orders')} className={`px-4 py-2 font-bold ${activeTab === 'orders' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}>Pedidos</button>
        <button onClick={() => setActiveTab('loyalty')} className={`px-4 py-2 font-bold ${activeTab === 'loyalty' ? 'text-purple-600 border-b-2 border-purple-600' : 'text-gray-500'}`}>Fidelidade Admin</button>
      </div>

      {/* ABA DE PEDIDOS */}
      {activeTab === 'orders' && (
        <>
            <div className="flex gap-2 mb-4">
                <button onClick={() => setFilter('all')} className="px-3 py-1 bg-gray-200 rounded">Todos</button>
                <button onClick={() => setFilter('pending')} className="px-3 py-1 bg-blue-100 text-blue-800 rounded">Pendentes</button>
            </div>
            
            <div className="space-y-3">
                {orders.map(order => (
                    <div key={order.id} className="bg-white p-4 rounded shadow flex justify-between items-center border border-gray-100">
                        <div>
                            <div className="flex items-center gap-2">
                                <p className="font-bold">{order.customer_name}</p>
                                {getBadge(order.status)}
                            </div>
                            <p className="text-xs text-gray-500 font-mono">{order.customer_phone}</p>
                            <p className="text-sm text-gray-700 mt-1">🛒 {order.items_summary}</p>
                            <p className="text-sm font-bold text-green-700">R$ {order.total.toFixed(2)}</p>
                        </div>
                        <div className="flex gap-2">
                            {!['approved', 'rejected'].includes(order.status) && (
                                <>
                                <button onClick={() => handleApprove(order.id)} className="p-2 bg-green-100 text-green-700 rounded-full hover:bg-green-200"><CheckCircle size={20}/></button>
                                <button onClick={() => handleReject(order.id)} className="p-2 bg-red-100 text-red-700 rounded-full hover:bg-red-200"><XCircle size={20}/></button>
                                </>
                            )}
                            <button onClick={() => handleDelete(order.id)} className="p-2 bg-gray-100 text-gray-600 rounded-full ml-2"><Trash2 size={20}/></button>
                        </div>
                    </div>
                ))}
            </div>
        </>
      )}

      {/* ABA DE FIDELIDADE COM DATA E VALIDADE */}
      {activeTab === 'loyalty' && (
        <div className="bg-white rounded shadow overflow-hidden">
            <div className="p-4 bg-purple-50 border-b border-purple-100 flex justify-between items-center">
                <h3 className="font-bold text-purple-900 flex items-center gap-2"><Gift size={20}/> Lista de Fidelidade</h3>
                <button onClick={fetchCustomers} className="text-sm text-purple-600 underline">Atualizar</button>
            </div>
            
            <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-600 border-b">
                    <tr>
                        <th className="px-4 py-3 text-left">Cliente</th>
                        <th className="px-4 py-3 text-center">Validade (30 dias)</th>
                        <th className="px-4 py-3 text-center">Pontos</th>
                        <th className="px-4 py-3 text-right">Ação</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {customers.map(c => {
                        // LÓGICA DE DATA
                        const startDate = new Date(c.created_at);
                        const today = new Date();
                        // Diferença em dias
                        const diffTime = Math.abs(today.getTime() - startDate.getTime());
                        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
                        
                        const isExpired = diffDays > 30;
                        const daysLeft = 30 - diffDays;
                        
                        const hasWon = c.total_quantity >= 20;
                        const progress = Math.min((c.total_quantity / 20) * 100, 100);

                        return (
                            <tr key={c.id} className={`hover:bg-gray-50 ${isExpired ? 'bg-red-50' : (hasWon ? "bg-green-50" : "")}`}>
                                <td className="px-4 py-4">
                                    <p className="font-bold text-gray-800">{c.customer_name}</p>
                                    <p className="text-xs text-gray-500 font-mono">{c.phone_number}</p>
                                </td>
                                
                                {/* COLUNA DA DATA */}
                                <td className="px-4 py-4 text-center">
                                    <div className="flex flex-col items-center text-xs">
                                        <span className="text-gray-500">Início: {startDate.toLocaleDateString('pt-BR')}</span>
                                        {isExpired ? (
                                            <span className="flex items-center gap-1 text-red-600 font-bold bg-red-100 px-2 py-1 rounded mt-1">
                                                <AlertTriangle size={12}/> EXPIRADO (+{diffDays-30}d)
                                            </span>
                                        ) : (
                                            <span className="text-blue-600 font-semibold flex items-center gap-1 mt-1">
                                                <Clock size={12}/> Restam {daysLeft} dias
                                            </span>
                                        )}
                                    </div>
                                </td>

                                <td className="px-4 py-4 text-center">
                                    <div className="flex flex-col items-center">
                                        <span className={`font-bold text-lg ${hasWon ? 'text-green-600' : 'text-purple-600'}`}>
                                            {c.total_quantity} / 20
                                        </span>
                                        <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                                            <div 
                                                className={`h-full ${hasWon ? 'bg-green-500' : 'bg-purple-500'}`} 
                                                style={{ width: `${progress}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                </td>

                                <td className="px-4 py-4 text-right">
                                    {isExpired ? (
                                        <button 
                                            onClick={() => handleResetCycle(c.phone_number, c.customer_name)}
                                            className="bg-red-100 text-red-700 px-3 py-1 rounded hover:bg-red-200 text-xs font-bold border border-red-200"
                                        >
                                            REINICIAR CICLO ↻
                                        </button>
                                    ) : (
                                        <>
                                            {hasWon ? (
                                                <button 
                                                    onClick={() => handleRedeemReward(c.phone_number, c.customer_name)}
                                                    className="bg-green-600 text-white px-3 py-1 rounded shadow hover:bg-green-700 text-xs font-bold animate-pulse"
                                                >
                                                    ENTREGAR PRÊMIO 🎁
                                                </button>
                                            ) : (
                                                <span className="text-gray-400 text-xs italic">...</span>
                                            )}
                                        </>
                                    )}
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
      )}
    </div>
  );
}