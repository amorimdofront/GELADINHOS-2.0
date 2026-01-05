import { Facebook, Instagram, Mail, MapPin, Phone, Twitter, IceCream } from 'lucide-react';

export default function Footer() {
  return (
    <footer id="contact" className="bg-gradient-to-br from-gray-900 to-gray-800 text-white">
      <div className="container mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          <div>
            <div className="flex items-center space-x-3 mb-6">
              <div className="bg-gradient-to-br from-blue-500 to-cyan-400 p-2 rounded-xl shadow-lg">
                <IceCream className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold">Geladinhos Pega e Lambe! </h3>
                <p className="text-sm text-gray-400">Sabor que refresca</p>
              </div>
            </div>
            <p className="text-gray-400 leading-relaxed">
              Proporcionando momentos refrescantes e saborosos. Qualidade e tradição em cada geladinho.
            </p>
          </div>

          <div>
            <h4 className="text-lg font-bold mb-6 text-cyan-400">Links Rápidos</h4>
            <ul className="space-y-3">
              <li>
                <a href="#home" className="text-gray-400 hover:text-cyan-400 transition-colors duration-300 flex items-center">
                  <span className="mr-2">→</span> Início
                </a>
              </li>
              <li>
                <a href="#products" className="text-gray-400 hover:text-cyan-400 transition-colors duration-300 flex items-center">
                  <span className="mr-2">→</span> Produtos
                </a>
              </li>
              <li>
                <a href="#about" className="text-gray-400 hover:text-cyan-400 transition-colors duration-300 flex items-center">
                  <span className="mr-2">→</span> Sobre Nós
                </a>
              </li>
              <li>
                <a href="#contact" className="text-gray-400 hover:text-cyan-400 transition-colors duration-300 flex items-center">
                  <span className="mr-2">→</span> Contato
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-bold mb-6 text-cyan-400">Contato</h4>
            <ul className="space-y-4">
              <li className="flex items-start">
                <MapPin className="w-5 h-5 text-cyan-400 mr-3 mt-1 flex-shrink-0" />
                <span className="text-gray-400">
                  Indisponivel no momento, 123<br />
                  Bairro da paz - Salvador, BA
                </span>
              </li>
              <li className="flex items-center">
                <Phone className="w-5 h-5 text-cyan-400 mr-3 flex-shrink-0" />
                <a href="tel:+5511999999999" className="text-gray-400 hover:text-cyan-400 transition-colors duration-300">
                  (71) 99978-4507
                </a>
              </li>
              <li className="flex items-center">
                <Mail className="w-5 h-5 text-cyan-400 mr-3 flex-shrink-0" />
                <a href="mailto:contato@geladinhosamorim.com.br" className="text-gray-400 hover:text-cyan-400 transition-colors duration-300">
                  contato@geladinhospegaelambe.com.br
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-bold mb-6 text-cyan-400">Redes Sociais</h4>
            <p className="text-gray-400 mb-6">
              Acompanhe nossas novidades e promoções nas redes sociais
            </p>
            <div className="flex space-x-4">
              <a
                href="#"
                className="bg-gray-800 p-3 rounded-lg hover:bg-gradient-to-br hover:from-blue-500 hover:to-cyan-400 transition-all duration-300 hover:scale-110 shadow-lg"
              >
                <Facebook className="w-6 h-6" />
              </a>
              <a
                href="#"
                className="bg-gray-800 p-3 rounded-lg hover:bg-gradient-to-br hover:from-blue-500 hover:to-cyan-400 transition-all duration-300 hover:scale-110 shadow-lg"
              >
                <Instagram className="w-6 h-6" />
              </a>
              <a
                href="#"
                className="bg-gray-800 p-3 rounded-lg hover:bg-gradient-to-br hover:from-blue-500 hover:to-cyan-400 transition-all duration-300 hover:scale-110 shadow-lg"
              >
                <Twitter className="w-6 h-6" />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-700 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm mb-4 md:mb-0">
              © 2025 Geladinhos Pega e Lambe!. Todos os direitos reservados.
            </p>
            <div className="flex space-x-6 text-sm text-gray-400">
              <a href="#" className="hover:text-cyan-400 transition-colors duration-300">
                Política de Privacidade
              </a>
              <a href="#" className="hover:text-cyan-400 transition-colors duration-300">
                Termos de Uso
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}