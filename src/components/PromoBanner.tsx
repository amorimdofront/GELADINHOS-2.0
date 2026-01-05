import { Gift, Sparkles } from 'lucide-react';

export default function PromoBanner() {
  return (
    <div className="relative bg-gradient-to-r from-blue-600 via-cyan-500 to-teal-500 rounded-xl overflow-hidden shadow-xl mb-12">
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-0 left-0 w-40 h-40 bg-white rounded-full blur-3xl -translate-y-1/2 -translate-x-1/2"></div>
        <div className="absolute bottom-0 right-0 w-40 h-40 bg-white rounded-full blur-3xl translate-y-1/2 translate-x-1/2"></div>
      </div>

      <div className="relative px-6 py-12 sm:px-8 sm:py-16 text-center">
        <div className="flex items-center justify-center gap-3 mb-4">
          <Sparkles className="w-6 h-6 text-white animate-pulse" />
          <span className="text-white font-bold text-sm sm:text-base tracking-wide">PROMOÇÃO ESPECIAL</span>
          <Sparkles className="w-6 h-6 text-white animate-pulse" />
        </div>

        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white mb-4 leading-tight">
          Compre 20 Geladinhos
          <span className="block text-white drop-shadow-lg">e Ganhe 5 Grátis!</span>
        </h2>

        <p className="text-white/90 text-lg sm:text-xl mb-6 max-w-2xl mx-auto">
          Promoção válida por 1 mês a partir da sua primeira compra. Quanto mais você compra, mais perto de ganhar sua recompensa!
        </p>

        <div className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg p-6 sm:p-8 inline-block mb-6">
          <div className="flex items-center gap-2 justify-center mb-3">
            <Gift className="w-6 h-6 text-white" />
            <span className="text-white font-bold">COMO FUNCIONA</span>
          </div>
          <ul className="text-white/95 space-y-2 text-sm sm:text-base">
            <li>✓ Faça suas compras normalmente pelo WhatsApp</li>
            <li>✓ Acumule 20 geladinhos em até 1 mês</li>
            <li>✓ Receba 5 geladinhos grátis automaticamente</li>
            <li>✓ Consulte seu progresso no site usando seu telefone</li>
          </ul>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href="#lookup"
            className="px-8 py-3 bg-white text-blue-600 rounded-lg hover:bg-gray-100 transition-colors font-bold text-base sm:text-lg shadow-lg"
          >
            Consultar Minhas Compras
          </a>
          <a
            href="https://wa.me/YOUR_WHATSAPP_NUMBER"
            target="_blank"
            rel="noopener noreferrer"
            className="px-8 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-bold text-base sm:text-lg shadow-lg"
          >
            Fazer Pedido no WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}
