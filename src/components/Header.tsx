export default function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 transition-all duration-300 bg-white/80 backdrop-blur-md border-b border-gray-200">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          
          {/* LOGO VIA LINK */}
          <div className="flex items-center space-x-3 group cursor-pointer">
            <div className="bg-white p-2 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
              <img
                src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRp1STScTrYrdGKmOxI1DUZBZoG2rEInTjkSA&s"
                alt="Geladinhos Pega e Lambe"
                className="w-12 h-12 object-contain"
              />
            </div>

            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
                Geladinhos Pega e Lambe!
              </h1>
              <p className="text-xs text-gray-600">Sabor que refresca</p>
            </div>
          </div>

          {/* MENU */}
          <nav className="hidden md:flex items-center space-x-8">
            <a href="#home" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
              Início
            </a>
            <a href="#products" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
              Produtos
            </a>
            <a href="#about" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
              Sobre
            </a>
            <a href="#contact" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
              Contato
            </a>
          </nav>

        </div>
      </div>
    </header>
  );
}