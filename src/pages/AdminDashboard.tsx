import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { LogOut } from 'lucide-react';
import ProductsManager from '../components/admin/ProductsManager';
import FinancialManager from '../components/admin/FinancialManager';
import DashboardOverview from '../components/admin/DashboardOverview';
import SalesManager from '../components/admin/SalesManager';
import ReportBuilder from '../components/admin/ReportBuilder';
import InventoryManager from '../components/admin/InventoryManager';
import OrdersManager from '../components/admin/OrdersManager';

type Tab = 'overview' | 'orders' | 'products' | 'sales' | 'inventory' | 'financial' | 'reports';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const { signOut } = useAuth();

  const tabs = [
    { id: 'overview' as Tab, label: 'Visão Geral' },
    { id: 'orders' as Tab, label: 'Pedidos' },
    { id: 'products' as Tab, label: 'Produtos' },
    { id: 'sales' as Tab, label: 'Vendas' },
    { id: 'inventory' as Tab, label: 'Inventário' },
    { id: 'financial' as Tab, label: 'Financeiro' },
    { id: 'reports' as Tab, label: 'Relatórios' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
              Painel Administrativo
            </h1>
            <button
              onClick={signOut}
              className="flex items-center space-x-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors duration-300"
            >
              <LogOut className="w-5 h-5" />
              <span>Sair</span>
            </button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        <div className="flex space-x-2 mb-8 bg-white rounded-xl p-2 shadow-sm">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 px-6 py-3 rounded-lg font-medium transition-all duration-300 ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-lg'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="animate-fade-in-up">
          {activeTab === 'overview' && <DashboardOverview />}
          {activeTab === 'orders' && <OrdersManager />}
          {activeTab === 'products' && <ProductsManager />}
          {activeTab === 'sales' && <SalesManager />}
          {activeTab === 'inventory' && <InventoryManager />}
          {activeTab === 'financial' && <FinancialManager />}
          {activeTab === 'reports' && <ReportBuilder />}
        </div>
      </div>
    </div>
  );
}
