import { useEffect, useState } from 'react';
import { supabase, Transaction, Sale } from '../../lib/supabase';
import { Download, BarChart3, PieChart, TrendingUp } from 'lucide-react';

export default function ReportBuilder() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  useEffect(() => {
    fetchData();
  }, [selectedMonth, selectedYear]);

  const fetchData = async () => {
    const [transactionsResult, salesResult, productsResult] = await Promise.all([
      supabase.from('transactions').select('*').order('date', { ascending: false }),
      supabase.from('sales').select('*, products(*)'),
      supabase.from('products').select('*')
    ]);

    if (transactionsResult.data) setTransactions(transactionsResult.data);
    if (salesResult.data) setSales(salesResult.data);
    if (productsResult.data) setProducts(productsResult.data);
    setLoading(false);
  };

  const filteredTransactions = transactions.filter(t => {
    const date = new Date(t.date);
    return date.getMonth() === selectedMonth && date.getFullYear() === selectedYear;
  });

  const filteredSales = sales.filter(s => {
    const date = new Date(s.date);
    return date.getMonth() === selectedMonth && date.getFullYear() === selectedYear;
  });

  const totalIncome = filteredTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const totalExpense = filteredTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const balance = totalIncome - totalExpense;
  const totalSalesQty = filteredSales.reduce((sum, s) => sum + s.quantity, 0);
  const totalSalesRevenue = filteredSales.reduce((sum, s) => sum + s.total_amount, 0);

  const generatePDF = async () => {
    const { generateAdvancedReport } = await import('../../utils/reportGenerator');

    const monthNames = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];

    await generateAdvancedReport({
      totalIncome,
      totalExpense,
      balance,
      totalSales: totalSalesQty,
      totalSalesRevenue,
      transactions: filteredTransactions,
      sales: filteredSales,
      products,
      currentMonth: monthNames[selectedMonth],
      currentYear: selectedYear
    });
  };

  const salesByProduct = products.map(p => {
    const productSales = filteredSales.filter(s => s.product_id === p.id);
    const totalQty = productSales.reduce((sum, s) => sum + s.quantity, 0);
    const totalRevenue = productSales.reduce((sum, s) => sum + s.total_amount, 0);
    return { product: p, totalQty, totalRevenue };
  })
    .filter(item => item.totalQty > 0)
    .sort((a, b) => b.totalRevenue - a.totalRevenue);

  const incomeByCategory: Record<string, number> = {};
  const expenseByCategory: Record<string, number> = {};

  filteredTransactions.forEach(t => {
    const amount = Number(t.amount);
    if (t.type === 'income') {
      incomeByCategory[t.category] = (incomeByCategory[t.category] || 0) + amount;
    } else {
      expenseByCategory[t.category] = (expenseByCategory[t.category] || 0) + amount;
    }
  });

  const topExpenses = Object.entries(expenseByCategory)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  if (loading) {
    return <div className="text-center py-12">Carregando...</div>;
  }

  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  return (
    <div>
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-8 space-y-4 md:space-y-0">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Gerador de Relatórios Avançados</h2>
          <p className="text-gray-600 mt-1">Análise completa e download em PDF profissional</p>
        </div>
        <button
          onClick={generatePDF}
          className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-500 text-white rounded-lg hover:shadow-lg transition-all duration-300 font-semibold"
        >
          <Download className="w-5 h-5" />
          <span>Baixar Relatório PDF</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Mês</label>
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          >
            {monthNames.map((month, index) => (
              <option key={index} value={index}>
                {month}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Ano</label>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          >
            {[2024, 2025, 2026].map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-200 shadow-md">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-semibold text-gray-600">RECEITAS</p>
            <TrendingUp className="w-5 h-5 text-green-600" />
          </div>
          <p className="text-3xl font-bold text-green-600">R$ {totalIncome.toFixed(2)}</p>
          <p className="text-xs text-gray-500 mt-2">{filteredTransactions.filter(t => t.type === 'income').length} transações</p>
        </div>

        <div className="bg-gradient-to-br from-red-50 to-pink-50 rounded-2xl p-6 border border-red-200 shadow-md">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-semibold text-gray-600">DESPESAS</p>
            <BarChart3 className="w-5 h-5 text-red-600" />
          </div>
          <p className="text-3xl font-bold text-red-600">R$ {totalExpense.toFixed(2)}</p>
          <p className="text-xs text-gray-500 mt-2">{filteredTransactions.filter(t => t.type === 'expense').length} transações</p>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-6 border border-blue-200 shadow-md">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-semibold text-gray-600">SALDO LÍQUIDO</p>
            <PieChart className="w-5 h-5 text-blue-600" />
          </div>
          <p className={`text-3xl font-bold ${balance >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
            R$ {balance.toFixed(2)}
          </p>
          <p className="text-xs text-gray-500 mt-2">Margem: {totalIncome > 0 ? ((balance / totalIncome) * 100).toFixed(2) : '0'}%</p>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-yellow-50 rounded-2xl p-6 border border-orange-200 shadow-md">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-semibold text-gray-600">VENDAS</p>
            <BarChart3 className="w-5 h-5 text-orange-600" />
          </div>
          <p className="text-3xl font-bold text-orange-600">{totalSalesQty}</p>
          <p className="text-xs text-gray-500 mt-2">R$ {totalSalesRevenue.toFixed(2)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center space-x-2">
            <BarChart3 className="w-5 h-5 text-indigo-600" />
            <span>Top 5 Produtos</span>
          </h3>
          <div className="space-y-4">
            {salesByProduct.slice(0, 5).map((item, index) => (
              <div key={item.product.id} className="flex items-center space-x-4 p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg">
                <div className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-800">{item.product.name}</p>
                  <p className="text-sm text-gray-600">{item.totalQty} unidades</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-green-600">R$ {item.totalRevenue.toFixed(2)}</p>
                  <p className="text-xs text-gray-500">{((item.totalRevenue / totalSalesRevenue) * 100).toFixed(1)}% do total</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center space-x-2">
            <BarChart3 className="w-5 h-5 text-red-600" />
            <span>Top 5 Despesas</span>
          </h3>
          <div className="space-y-4">
            {topExpenses.map(([category, amount], index) => {
              const percentage = (amount / totalExpense) * 100;
              return (
                <div key={category} className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-red-600 text-white flex items-center justify-center font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800">{category}</p>
                        <p className="text-xs text-gray-500">{percentage.toFixed(1)}% do total</p>
                      </div>
                    </div>
                    <p className="font-bold text-red-600">R$ {amount.toFixed(2)}</p>
                  </div>
                  <div className="w-full bg-gray-300 rounded-full h-2">
                    <div
                      className="bg-red-600 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl shadow-lg p-8 text-white">
        <h3 className="text-xl font-bold mb-6">📊 RESUMO EXECUTIVO</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <p className="text-indigo-200 text-sm mb-2">Taxa de Cobertura</p>
            <p className="text-3xl font-bold">
              {((totalIncome / (totalExpense || 1)) * 100).toFixed(2)}%
            </p>
            <p className="text-xs text-indigo-300 mt-1">Receita por real gasto</p>
          </div>
          <div>
            <p className="text-indigo-200 text-sm mb-2">Ticket Médio de Venda</p>
            <p className="text-3xl font-bold">
              R$ {totalSalesQty > 0 ? (totalSalesRevenue / totalSalesQty).toFixed(2) : '0'}
            </p>
            <p className="text-xs text-indigo-300 mt-1">Por unidade vendida</p>
          </div>
          <div>
            <p className="text-indigo-200 text-sm mb-2">Margem de Lucro</p>
            <p className="text-3xl font-bold">
              {totalIncome > 0 ? ((balance / totalIncome) * 100).toFixed(2) : '0'}%
            </p>
            <p className="text-xs text-indigo-300 mt-1">Lucro sobre receita</p>
          </div>
        </div>
      </div>
    </div>
  );
}
