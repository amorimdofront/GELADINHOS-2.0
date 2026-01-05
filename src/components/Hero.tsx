import { ChevronDown } from 'lucide-react';
import { useEffect, useRef } from 'react';

export default function Hero() {
  const blobRef = useRef(null);

  useEffect(() => {
    const blob = blobRef.current;

    const moveBlob = (e) => {
      const { clientX, clientY } = e;
      blob.animate(
        {
          left: `${clientX}px`,
          top: `${clientY}px`,
        },
        {
          duration: 900,
          fill: 'forwards',
          easing: 'ease-out',
        }
      );
    };

    window.addEventListener('mousemove', moveBlob);
    return () => window.removeEventListener('mousemove', moveBlob);
  }, []);

  return (
    <section
      id="home"
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      {/* IMAGEM DE FUNDO */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url('https://i.imgur.com/gdgtDaw.jpeg')",
        }}
      ></div>

      {/* OVERLAY (escurece + suaviza a imagem) */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-cyan-50/20 to-emerald-50/20 backdrop-blur-sm"></div>

      {/* BLOB QUE SEGUE O MOUSE */}
      <div
        ref={blobRef}
        className="pointer-events-none absolute w-[420px] h-[420px] rounded-full
        bg-gradient-to-r from-cyan-300 via-sky-300 to-emerald-300
        opacity-35 blur-3xl -translate-x-1/2 -translate-y-1/2"
        style={{ left: '50%', top: '50%' }}
      ></div>

      {/* CONTEÚDO */}
      <div className="relative z-10 container mx-auto px-6 pt-20 text-center">
        <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold mb-6 leading-tight">
          <span className="bg-gradient-to-r from-sky-600 via-cyan-500 to-emerald-500 bg-clip-text text-transparent">
            Geladinhos
          </span>
          <br />
          <span className="text-gray-800">Gourmet</span>
        </h1>

        <p className="text-xl md:text-2xl text-gray-700 mb-12 max-w-2xl mx-auto">
          Refrescância, sabor e qualidade em cada geladinho
        </p>

        <a
          href="#products"
          className="inline-flex items-center px-10 py-4
          bg-gradient-to-r from-sky-500 to-cyan-500
          text-white rounded-full font-semibold text-lg
          shadow-lg hover:shadow-xl hover:scale-105
          transition-all duration-300"
        >
          Ver sabores
        </a>

        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <ChevronDown className="w-8 h-8 text-gray-600" />
        </div>
      </div>
    </section>
  );
}