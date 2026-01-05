import { useState } from 'react';
import { supabase } from '../lib/supabase';
import {
  Search,
  Gift,
  Smartphone,
  Loader2,
  Clock,
  Calendar,
  AlertTriangle,
  Trophy
} from 'lucide-react';

interface CustomerData {
  customer_name: string;
  total_quantity: number;
  created_at: string;
  last_purchase_date: string;
}

export default function CustomerLookup() {
  const [phone, setPhone] = useState('');
  const [customer, setCustomer] = useState<CustomerData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searched, setSearched] = useState(false);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 11) value = value.slice(0, 11);

    if (value.length > 10)
      value = value.replace(/^(\d\d)(\d{5})(\d{4}).*/, '($1) $2-$3');
    else if (value.length > 5)
      value = value.replace(/^(\d\d)(\d{4})(\d{0,4}).*/, '($1) $2-$3');
    else if (value.length > 2)
      value = value.replace(/^(\d\d)(\d{0,5}).*/, '($1) $2');

    setPhone(value);
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.length < 14) return;

    setLoading(true);
    setError('');
    setCustomer(null);
    setSearched(false);

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) await supabase.auth.signInAnonymously();

      const cleanPhone = phone.replace(/\D/g, '');

      let { data, error } = await supabase
        .from('whatsapp_customer_purchases')
        .select('*')
        .eq('phone_number', cleanPhone)
        .maybeSingle();

      if (error) throw error;
      if (!data) setError('Não encontramos cadastro para este número.');
      else setCustomer(data as CustomerData);

    } catch {
      setError('Erro de conexão. Tente novamente.');
    } finally {
      setLoading(false);
      setSearched(true);
    }
  };

  const calculateExpiration = () => {
    if (!customer) return { isExpired: false, daysLeft: 0, startDate: null };
    const startDate = new Date(customer.created_at);
    const diffDays = Math.ceil(
      Math.abs(Date.now() - startDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    return {
      isExpired: diffDays > 30,
      daysLeft: Math.max(0, 30 - diffDays),
      startDate
    };
  };

  const { isExpired, daysLeft, startDate } = calculateExpiration();
  const progress = Math.min(((customer?.total_quantity || 0) / 20) * 100, 100);
  const hasWon = (customer?.total_quantity || 0) >= 20;

  return (
    /* FUNDO – AGORA MUDA DE VERDADE */
    <div className="min-h-screen flex items-center justify-center px-4
      bg-gradient-to-br from-[#0f172a] via-[#1e1b4b] to-[#312e81]">

      {/* CARD – GLASS REAL */}
      <div className="
        w-full max-w-md rounded-3xl p-8
        bg-white/90 backdrop-blur-xl
        shadow-[0_20px_60px_rgba(0,0,0,0.4)]
        transition-all duration-300
        hover:scale-[1.01]
      ">

        {/* HEADER */}
        <div className="text-center mb-8">
          <div className="
            mx-auto w-16 h-16 rounded-2xl
            bg-gradient-to-br from-blue-500 to-indigo-600
            flex items-center justify-center
            shadow-lg mb-4
            transition-transform duration-300
            hover:rotate-6
          ">
            <Gift className="text-white w-8 h-8" />
          </div>

          <h1 className="text-2xl font-extrabold text-gray-800">
            Clube de Pontos
          </h1>
          <p className="text-gray-500 text-sm">
            Consulte usando seu WhatsApp
          </p>
        </div>

        {/* FORM */}
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="relative">
            <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="tel"
              value={phone}
              onChange={handlePhoneChange}
              placeholder="(00) 00000-0000"
              className="
                w-full pl-12 pr-4 py-4 rounded-2xl
                bg-gray-100 text-gray-800 font-semibold
                border-2 border-transparent
                focus:border-blue-500 focus:bg-white
                transition-all
              "
            />
          </div>

          <button
            type="submit"
            disabled={loading || phone.length < 14}
            className="
              w-full py-4 rounded-2xl font-bold text-white
              bg-gradient-to-r from-blue-600 to-indigo-600
              shadow-lg
              transition-all duration-200
              hover:brightness-110
              active:scale-95
              disabled:opacity-40 disabled:cursor-not-allowed
              flex items-center justify-center gap-2
            "
          >
            {loading ? <Loader2 className="animate-spin" /> : <><Search /> Consultar</>}
          </button>
        </form>

        {/* ERRO */}
        {error && (
          <div className="
            mt-6 p-4 rounded-xl text-sm font-medium text-center
            bg-red-100 text-red-700
            transition-opacity duration-300
          ">
            {error}
          </div>
        )}

        {/* RESULTADO */}
        {customer && (
          <div className="
            mt-6 rounded-2xl overflow-hidden
            border border-gray-200
            shadow-md
            transition-all duration-300
          ">
            <div className={`
              p-3 flex justify-between text-xs font-bold uppercase
              ${isExpired ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}
            `}>
              <span className="flex gap-1 items-center">
                {isExpired ? <AlertTriangle size={14}/> : <Clock size={14}/>}
                {isExpired ? 'Expirado' : 'Ativo'}
              </span>
              <span>{isExpired ? '0 dias' : `${daysLeft} dias`}</span>
            </div>

            <div className="p-6 text-center">
              <h2 className="text-xl font-bold mb-4">{customer.customer_name}</h2>

              <div className="mb-3">
                <span className={`text-5xl font-black ${isExpired ? 'text-gray-400' : 'text-blue-600'}`}>
                  {customer.total_quantity}
                </span>
                <span className="text-gray-400 font-bold">/20</span>
              </div>

              <div className="h-4 w-full bg-gray-200 rounded-full overflow-hidden mb-4">
                <div
                  className={`h-full transition-all duration-700
                    ${isExpired ? 'bg-gray-400' : hasWon ? 'bg-green-500' : 'bg-blue-500'}
                  `}
                  style={{ width: `${progress}%` }}
                />
              </div>

              {hasWon && !isExpired && (
                <div className="bg-green-100 text-green-800 p-4 rounded-xl font-bold">
                  <Trophy className="mx-auto mb-2" />
                  Prêmio disponível!
                </div>
              )}
            </div>

            <div className="bg-gray-100 p-2 text-center text-xs text-gray-500">
              <Calendar size={12} className="inline mr-1" />
              Início: {startDate?.toLocaleDateString('pt-BR')}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
