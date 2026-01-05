import { useEffect, useState } from 'react';
import { supabase, Transaction } from '../../lib/supabase';
import { Plus, Edit2, Trash2, X, Filter, Download } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export default function FinancialManager() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    type: 'income' as 'income' | 'expense',
    description: '',
    amount: '',
    category: '',
    date: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .order('date', { ascending: false });

    if (!error && data) {
      setTransactions(data);
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (editingTransaction) {
      await supabase
        .from('transactions')
        .update({
          ...formData,
          amount: parseFloat(formData.amount)
        })
        .eq('id', editingTransaction.id);
    } else {
      await supabase
        .from('transactions')
        .insert([{
          ...formData,
          amount: parseFloat(formData.amount),
          created_by: user?.id
        }]);
    }

    resetForm();
    fetchTransactions();
  };

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta transação?')) {
      await supabase.from('transactions').delete().eq('id', id);
      fetchTransactions();
    }
  };

  const resetForm = () => {
    setFormData({
      type: 'income',
      description: '',
      amount: '',
      category: '',
      date: new Date().toISOString().split('T')[0]
    });
    setEditingTransaction(null);
    setShowModal(false);
  };

  const openEditModal = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setFormData({
      type: transaction.type,
      description: transaction.description,
      amount: transaction.amount.toString(),
      category: transaction.category,
      date: transaction.date
    });
    setShowModal(true);
  };

  const exportToCSV = () => {
    const now = new Date();
    const reportDate = now.toLocaleDateString('pt-BR');
    const reportTime = now.toLocaleTimeString('pt-BR');

    let csvContent = '\ufeff';
    csvContent += 'GELADINHOS AMORIM\n';
    csvContent += 'RELATÓRIO FINANCEIRO DETALHADO\n';
    csvContent += `Data de Geração: ${reportDate} - ${reportTime}\n\n`;

    csvContent += 'RESUMO FINANCEIRO\n';
    csvContent += '─'.repeat(50) + '\n';
    csvContent += `Total de Receitas:,R$ ${totalIncome.toFixed(2)}\n`;
    csvContent += `Total de Despesas:,R$ ${totalExpense.toFixed(2)}\n`;
    csvContent += `Saldo Líquido:,R$ ${balance.toFixed(2)}\n`;
    csvContent += `Margem Líquida:,${((balance / totalIncome) * 100).toFixed(2)}%\n\n`;

    csvContent += 'DETALHAMENTO DE TRANSAÇÕES\n';
    csvContent += '─'.repeat(50) + '\n';
    csvContent += 'Data,Tipo,Descrição,Categoria,Valor,Saldo Parcial\n';

    let runningBalance = 0;
    filteredTransactions.forEach(t => {
      const amount = Number(t.amount);
      runningBalance += t.type === 'income' ? amount : -amount;
      csvContent += `${new Date(t.date).toLocaleDateString('pt-BR')},${t.type === 'income' ? 'Receita' : 'Despesa'},"${t.description}",${t.category},R$ ${amount.toFixed(2)},R$ ${runningBalance.toFixed(2)}\n`;
    });

    csvContent += '\n\nANÁLISE POR CATEGORIA\n';
    csvContent += '─'.repeat(50) + '\n';

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

    csvContent += 'RECEITAS POR CATEGORIA\n';
    csvContent += 'Categoria,Valor,Percentual\n';
    Object.entries(incomeByCategory)
      .sort((a, b) => b[1] - a[1])
      .forEach(([cat, val]) => {
        const percentage = totalIncome > 0 ? ((val / totalIncome) * 100).toFixed(2) : '0.00';
        csvContent += `${cat},R$ ${val.toFixed(2)},${percentage}%\n`;
      });

    csvContent += '\nDESPESAS POR CATEGORIA\n';
    csvContent += 'Categoria,Valor,Percentual\n';
    Object.entries(expenseByCategory)
      .sort((a, b) => b[1] - a[1])
      .forEach(([cat, val]) => {
        const percentage = totalExpense > 0 ? ((val / totalExpense) * 100).toFixed(2) : '0.00';
        csvContent += `${cat},R$ ${val.toFixed(2)},${percentage}%\n`;
      });

    csvContent += '\n\nNOTAS\n';
    csvContent += '─'.repeat(50) + '\n';
    csvContent += 'Este relatório foi gerado automaticamente pelo Painel Administrativo Geladinhos Amorim\n';
    csvContent += 'Todas as datas estão no formato DD/MM/AAAA\n';

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `relatorio_financeiro_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const filteredTransactions = filterType === 'all'
    ? transactions
    : transactions.filter(t => t.type === filterType);

  const totalIncome = filteredTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const totalExpense = filteredTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const balance = totalIncome - totalExpense;

  if (loading) {
    return <div className="text-center py-12">Carregando...</div>;
  }

  return (
    <div>
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 space-y-4 md:space-y-0">
        <h2 className="text-2xl font-bold text-gray-800">Gestão Financeira</h2>
        <div className="flex space-x-2">
          <button
            onClick={exportToCSV}
            className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-300"
          >
            <Download className="w-5 h-5" />
            <span>Exportar CSV</span>
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-lg hover:shadow-lg transition-all duration-300"
          >
            <Plus className="w-5 h-5" />
            <span>Nova Transação</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-gradient-to-br from-green-500 to-emerald-400 rounded-2xl p-6 text-white shadow-lg">
          <p className="text-sm opacity-90 mb-2">Saldo Total</p>
          <p className="text-3xl font-bold">R$ {balance.toFixed(2)}</p>
        </div>
        <div className="bg-gradient-to-br from-blue-500 to-cyan-400 rounded-2xl p-6 text-white shadow-lg">
          <p className="text-sm opacity-90 mb-2">Total de Receitas</p>
          <p className="text-3xl font-bold">R$ {totalIncome.toFixed(2)}</p>
        </div>
        <div className="bg-gradient-to-br from-red-500 to-pink-400 rounded-2xl p-6 text-white shadow-lg">
          <p className="text-sm opacity-90 mb-2">Total de Despesas</p>
          <p className="text-3xl font-bold">R$ {totalExpense.toFixed(2)}</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <Filter className="w-5 h-5 text-gray-600" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as 'all' | 'income' | 'expense')}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Todas</option>
              <option value="income">Receitas</option>
              <option value="expense">Despesas</option>
            </select>
          </div>
          <p className="text-sm text-gray-600">
            {filteredTransactions.length} transação(ões)
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Data</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Descrição</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Categoria</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Tipo</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-600">Valor</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-600">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.map((transaction) => (
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
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => openEditModal(transaction)}
                      className="text-blue-600 hover:text-blue-800 mr-3 transition-colors duration-300"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(transaction.id)}
                      className="text-red-600 hover:text-red-800 transition-colors duration-300"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredTransactions.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              Nenhuma transação encontrada
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
            <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h3 className="text-2xl font-bold text-gray-800">
                {editingTransaction ? 'Editar Transação' : 'Nova Transação'}
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
                <label className="block text-sm font-medium text-gray-700 mb-2">Tipo</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as 'income' | 'expense' })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="income">Receita</option>
                  <option value="expense">Despesa</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Descrição</label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Valor (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Data</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Categoria</label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ex: Vendas, Matéria-prima, Aluguel"
                  required
                />
              </div>

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
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-lg hover:shadow-lg transition-all duration-300"
                >
                  {editingTransaction ? 'Atualizar' : 'Criar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
