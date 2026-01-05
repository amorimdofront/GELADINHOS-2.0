import { useEffect, useState } from 'react';
import { supabase, Transaction, Sale } from '../../lib/supabase';
import { TrendingUp, TrendingDown, DollarSign, Package, ShoppingBag, BarChart3 } from 'lucide-react';

export default function DashboardOverview() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const [transactionsResult, productsResult, salesResult] = await Promise.all([
      supabase.from('transactions').select('*').order('date', { ascending: false }),
      supabase.from('products').select('id', { count: 'exact' }),
      supabase.from('sales').select('*')
    ]);

    if (transactionsResult.data) setTransactions(transactionsResult.data);
    if (productsResult.count !== null) setTotalProducts(productsResult.count);
    if (salesResult.data) setSales(salesResult.data);
    setLoading(false);
  };

  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const totalExpense = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const balance = totalIncome - totalExpense;

  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  const monthlyIncome = transactions
    .filter(t => {
      const date = new Date(t.date);
      return t.type === 'income' && date.getMonth() === currentMonth && date.getFullYear() === currentYear;
    })
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const monthlyExpense = transactions
    .filter(t => {
      const date = new Date(t.date);
      return t.type === 'expense' && date.getMonth() === currentMonth && date.getFullYear() === currentYear;
    })
    .reduce((sum, t) => sum + Number(t.amount), 0);

  if (loading) {
    return <div className="text-center py-12">Carregando...</div>;
  }

  const totalSalesRevenue = sales.reduce((sum, s) => sum + s.total_amount, 0);
  const totalSalesQty = sales.reduce((sum, s) => sum + s.quantity, 0);
  const profitMargin = totalIncome > 0 ? ((balance / totalIncome) * 100) : 0;

  const stats = [
    {
      title: 'Saldo Total',
      value: `R$ ${balance.toFixed(2)}`,
      icon: DollarSign,
      color: 'from-green-500 to-emerald-400',
      textColor: 'text-green-600'
    },
    {
      title: 'Receitas (Mês)',
      value: `R$ ${monthlyIncome.toFixed(2)}`,
      icon: TrendingUp,
      color: 'from-blue-500 to-cyan-400',
      textColor: 'text-blue-600'
    },
    {
      title: 'Despesas (Mês)',
      value: `R$ ${monthlyExpense.toFixed(2)}`,
      icon: TrendingDown,
      color: 'from-red-500 to-pink-400',
      textColor: 'text-red-600'
    },
    {
      title: 'Total de Vendas',
      value: totalSalesQty.toString(),
      icon: ShoppingBag,
      color: 'from-orange-500 to-yellow-400',
      textColor: 'text-orange-600'
    },
    {
      title: 'Receita (Vendas)',
      value: `R$ ${totalSalesRevenue.toFixed(2)}`,
      icon: BarChart3,
      color: 'from-indigo-500 to-purple-400',
      textColor: 'text-indigo-600'
    },
    {
      title: 'Total de Produtos',
      value: totalProducts.toString(),
      icon: Package,
      color: 'from-pink-500 to-rose-400',
      textColor: 'text-pink-600'
    }
  ];

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`bg-gradient-to-br ${stat.color} p-3 rounded-xl shadow-lg`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
              <h3 className="text-gray-600 text-sm font-medium mb-1">{stat.title}</h3>
              <p className={`text-3xl font-bold ${stat.textColor}`}>{stat.value}</p>
            </div>
          );
        })}
      </div>

      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Transações Recentes</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Data</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Descrição</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Categoria</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Tipo</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-600">Valor</th>
              </tr>
            </thead>
            <tbody>
              {transactions.slice(0, 10).map((transaction) => (
                <tr key={transaction.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors duration-200">
                  <td className="py-3 px-4 text-sm text-gray-800">
                    {new Date(transaction.date).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-800">{transaction.description}</td>
                  <td className="py-3 px-4 text-sm">
                    <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
                      {transaction.category}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm">
                    <span className={`px-3 py-1 rounded-full text-xs ${
                      transaction.type === 'income'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {transaction.type === 'income' ? 'Receita' : 'Despesa'}
                    </span>
                  </td>
                  <td className={`py-3 px-4 text-sm font-semibold text-right ${
                    transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {transaction.type === 'income' ? '+' : '-'} R$ {Number(transaction.amount).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {transactions.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              Nenhuma transação registrada ainda
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
