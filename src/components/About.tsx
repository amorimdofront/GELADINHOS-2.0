import { Heart, Leaf, Star, Users } from 'lucide-react';

export default function About() {
  const features = [
    {
      icon: Heart,
      title: 'Feito com Amor',
      description: 'Cada geladinho é preparado artesanalmente com dedicação e carinho'
    },
    {
      icon: Leaf,
      title: 'Ingredientes Naturais',
      description: 'Utilizamos apenas ingredientes selecionados e de alta qualidade'
    },
    {
      icon: Star,
      title: 'Sabores Únicos',
      description: 'Desenvolvemos sabores exclusivos que você não encontra em outro lugar'
    },
    {
      icon: Users,
      title: 'Tradição Familiar',
      description: 'Receitas passadas de geração em geração da família Amorim'
    }
  ];

  return (
    <section id="about" className="py-20 bg-gradient-to-br from-blue-50 to-cyan-50">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16 animate-fade-in-up">
          <h2 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
            Nossa História
          </h2>
          <p className="text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed">
            A Geladinhos Amorim nasceu do sonho de compartilhar momentos refrescantes e saborosos
            com nossa comunidade. Com mais de 10 anos de tradição, somos referência em qualidade e sabor.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 animate-fade-in-up group"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="bg-gradient-to-br from-blue-500 to-cyan-400 w-16 h-16 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <Icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-3 group-hover:text-blue-600 transition-colors duration-300">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
