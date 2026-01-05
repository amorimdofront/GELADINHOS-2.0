import { useState } from 'react';
import { supabase } from '../lib/supabase';
import {
  Search,
  Gift,
  Smartphone,
  Loader2,
  Calendar,
  AlertOctagon,
  Trophy,
  History,
  CheckCircle2,
  XCircle
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
      if (!data) setError('Ops! Não encontramos cadastro para este número.');
      else setCustomer(data as CustomerData);

    } catch {
      setError('Erro de conexão. Verifique sua internet.');
    } finally {
      setLoading(false);
      setSearched(true);
    }
  };

  const calculateExpiration = () => {
    if (!customer) return { isExpired: false, daysLeft: 0, startDate: null, limitDate: null };
    
    const startDate = new Date(customer.created_at);
    // Adiciona 30 dias à data de criação
    const limitDate = new Date(startDate);
    limitDate.setDate(limitDate.getDate() + 30);
    
    const now = new Date();
    
    // Calcula diferença em milissegundos
    const diffTime = limitDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return {
      isExpired: diffDays <= 0,
      daysLeft: Math.max(0, diffDays),
      startDate,
      limitDate
    };
  };

  const { isExpired, daysLeft, startDate, limitDate } = calculateExpiration();
  const maxPoints = 20;
  const currentPoints = customer?.total_quantity || 0;
  const progress = Math.min((currentPoints / maxPoints) * 100, 100);
  const hasWon = currentPoints >= maxPoints;

  // Formatação de data bonita
  const formatDate = (date: Date | null) => {
    if (!date) return '-';
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    }).format(date);
  };

  return (
    // FUNDO RICO E COMPLEXO (EVITA TELA BRANCA)
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#0F172A] relative overflow-hidden">
      
      {/* Elementos de Fundo (Blur/Glow) */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-purple-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
      <div className="absolute -bottom-32 left-20 w-96 h-96 bg-pink-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>

      {/* CARD PRINCIPAL */}
      <div className="
        w-full max-w-[420px] 
        bg-slate-900/80 backdrop-blur-xl 
        border border-slate-700/50 
        rounded-[2rem] 
        shadow-[0_0_40px_rgba(0,0,0,0.3)]
        relative z-10
        overflow-hidden
      ">
        
        {/* CABEÇALHO COM GRADIENTE */}
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-8 pb-10 text-center border-b border-slate-700/50">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-tr from-violet-600 to-indigo-600 shadow-lg shadow-indigo-500/30 mb-5 transform rotate-3 hover:rotate-0 transition-all duration-300">
            <Gift className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight mb-2">
            Clube de Pontos
          </h1>
          <p className="text-slate-400 font-medium">
            Digite seu WhatsApp para consultar
          </p>
        </div>

        <div className="p-8 -mt-6 bg-slate-900/50 rounded-t-[2rem]">
          {/* FORMULÁRIO */}
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-violet-600 to-blue-600 rounded-xl opacity-50 group-focus-within:opacity-100 transition duration-300 blur-sm"></div>
              <div className="relative bg-slate-900 rounded-xl flex items-center">
                <Smartphone className="absolute left-4 text-slate-400 group-focus-within:text-violet-400 transition-colors" size={20} />
                <input
                  type="tel"
                  value={phone}
                  onChange={handlePhoneChange}
                  placeholder="(00) 00000-0000"
                  className="
                    w-full pl-12 pr-4 py-4 
                    bg-transparent 
                    text-white font-bold text-lg 
                    placeholder-slate-600 
                    rounded-xl 
                    focus:outline-none
                  "
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || phone.length < 14}
              className="
                w-full py-4 rounded-xl font-bold text-white text-lg
                bg-gradient-to-r from-violet-600 to-indigo-600
                shadow-lg shadow-indigo-500/25
                hover:shadow-indigo-500/40 hover:scale-[1.02]
                active:scale-95
                disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none
                transition-all duration-200
                flex items-center justify-center gap-2
              "
            >
              {loading ? <Loader2 className="animate-spin" /> : <><Search size={20} /> Consultar Pontos</>}
            </button>
          </form>

          {/* MENSAGEM DE ERRO */}
          {error && (
            <div className="mt-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-semibold text-center flex items-center justify-center gap-2 animate-pulse">
              <XCircle size={18} /> {error}
            </div>
          )}

          {/* RESULTADO - MOSTRA APENAS SE TIVER CLIENTE */}
          {customer && (
            <div className="mt-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              
              {/* CARTÃO DE STATUS */}
              <div className={`
                relative overflow-hidden rounded-2xl p-6 border-2
                ${isExpired 
                  ? 'bg-red-950/30 border-red-500/30' 
                  : 'bg-indigo-950/30 border-indigo-500/30'}
              `}>
                
                {/* CABEÇALHO DO CARTÃO */}
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="text-white font-bold text-xl truncate max-w-[180px]">
                      {customer.customer_name}
                    </h2>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className={`w-2 h-2 rounded-full ${isExpired ? 'bg-red-500' : 'bg-green-400'} animate-pulse`}></span>
                      <span className={`text-xs font-bold uppercase tracking-wider ${isExpired ? 'text-red-400' : 'text-green-400'}`}>
                        {isExpired ? 'Expirado' : 'Ativo'}
                      </span>
                    </div>
                  </div>
                  
                  {/* DATA LIMITE (DESTAQUE) */}
                  <div className="text-right">
                    <p className="text-[10px] uppercase text-slate-400 font-bold mb-0.5">Válido até</p>
                    <div className={`
                      inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-bold
                      ${isExpired ? 'bg-red-500 text-white' : 'bg-slate-700 text-slate-200'}
                    `}>
                      <Calendar size={12} />
                      {formatDate(limitDate)}
                    </div>
                  </div>
                </div>

                {/* PROGRESSO GRANDE */}
                <div className="mb-2 flex items-end justify-between">
                  <div>
                    <span className={`text-5xl font-black ${isExpired ? 'text-slate-500' : 'text-white'}`}>
                      {currentPoints}
                    </span>
                    <span className="text-slate-500 font-bold text-lg">/{maxPoints}</span>
                  </div>
                  {hasWon && !isExpired && (
                     <Trophy className="text-yellow-400 w-10 h-10 mb-2 animate-bounce" />
                  )}
                </div>

                {/* BARRA DE PROGRESSO */}
                <div className="h-4 w-full bg-slate-800 rounded-full overflow-hidden shadow-inner relative">
                  <div
                    className={`h-full transition-all duration-1000 ease-out relative
                      ${isExpired 
                        ? 'bg-slate-600' 
                        : hasWon 
                          ? 'bg-gradient-to-r from-green-400 to-emerald-500' 
                          : 'bg-gradient-to-r from-violet-500 to-fuchsia-500'}
                    `}
                    style={{ width: `${progress}%` }}
                  >
                    {/* Brilho na barra */}
                    {!isExpired && <div className="absolute top-0 right-0 bottom-0 w-full bg-gradient-to-r from-transparent to-white/30 skew-x-12"></div>}
                  </div>
                </div>

                {/* MENSAGEM FINAL: GANHOU OU PERDEU */}
                <div className="mt-6 pt-4 border-t border-slate-700/50">
                  {isExpired ? (
                    <div className="flex items-center gap-3 text-red-400">
                      <div className="p-2 bg-red-500/10 rounded-lg">
                        <AlertOctagon size={24} />
                      </div>
                      <div className="text-xs leading-tight">
                        <strong className="block text-sm">Prazo Esgotado</strong>
                        A validade de 30 dias expirou.<br/>
                        Início: {formatDate(startDate)}
                      </div>
                    </div>
                  ) : hasWon ? (
                    <div className="flex items-center gap-3 text-green-400">
                      <div className="p-2 bg-green-500/10 rounded-lg">
                        <CheckCircle2 size={24} />
                      </div>
                      <div className="text-xs leading-tight">
                        <strong className="block text-sm">Prêmio Disponível!</strong>
                        Mostre essa tela ao atendente.<br/>
                        Expira em: {daysLeft} dias.
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 text-slate-400">
                      <div className="p-2 bg-slate-800 rounded-lg">
                        <History size={24} />
                      </div>
                      <div className="text-xs leading-tight">
                        <strong className="block text-sm text-slate-200">Continue comprando!</strong>
                        Faltam {maxPoints - currentPoints} pontos.<br/>
                        Sua campanha iniciou em: {formatDate(startDate)}
                      </div>
                    </div>
                  )}
                </div>

              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}