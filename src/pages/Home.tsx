import Header from '../components/Header';
import Hero from '../components/Hero';
import PromoBanner from '../components/PromoBanner';
import Products from '../components/Products';
import CustomerLookup from '../components/CustomerLookup';
import About from '../components/About';
import Footer from '../components/Footer';

export default function Home() {
  return (
    <div>
      <Header />
      <Hero />
      <div className="container mx-auto px-6 py-12">
        <PromoBanner />
      </div>
      <Products />
      <div className="container mx-auto px-6 py-12">
        <div id="lookup" className="bg-gray-50 rounded-xl p-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">Acompanhe Seu Progresso</h2>
          <CustomerLookup />
        </div>
      </div>
      <About />
      <Footer />
    </div>
  );
}
