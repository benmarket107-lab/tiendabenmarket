import React from 'react';
import { Store, Heart, ShieldCheck, Leaf } from 'lucide-react';
import tiendaImg from '../images/tienda.jpg';

export default function About() {
  return (
    <div className="w-full bg-surface min-h-screen py-8 sm:py-12 px-4 sm:px-6 lg:px-8 mb-20 md:mb-0">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10 sm:mb-16">
          <h1 className="font-headline text-4xl sm:text-5xl font-black text-on-surface mb-4 tracking-tight">
            Nuestra <span className="text-primary">Historia</span>
          </h1>
          <p className="text-on-surface-variant text-base sm:text-xl max-w-2xl mx-auto leading-relaxed">
            Desde nuestros inicios, nos hemos comprometido a ofrecer un espacio práctico y accesible, con todos los productos y servicios necesarios para facilitar el día a día de nuestros clientes.
          </p>
        </div>

        <div className="rounded-3xl overflow-hidden mb-12 sm:mb-16 shadow-lg border border-outline-variant/20">
          <img 
            src={tiendaImg} 
            alt="Nuestra Tienda" 
            className="w-full h-[250px] sm:h-[400px] object-cover object-top" 
          />
        </div>

        <div className="space-y-12 sm:space-y-16">
          <section className="bg-surface-container-lowest p-6 sm:p-10 rounded-3xl border border-outline-variant/20 shadow-sm">
            <h2 className="font-headline text-2xl sm:text-3xl font-bold text-on-surface mb-6">¿Cómo empezamos?</h2>
            <div className="space-y-4">
              <p className="text-on-surface-variant leading-relaxed text-base sm:text-lg">
                BenMarket nació en el año 2021 del sueño de una familia que entendió las necesidades reales de su comunidad. Creamos un espacio más cercano, práctico y accesible: un concepto único, más pequeño que un supermercado, pero con todo lo necesario para tus compras del mes y las gestiones del día a día. Además, ampliamos nuestro modelo de negocio ofreciendo servicios de pago de facturas, para que puedas realizar todo en un solo lugar, con comodidad y sin perder tiempo.
              </p>
            </div>
          </section>

          <section>
            <h2 className="font-headline text-2xl sm:text-3xl font-bold text-on-surface mb-6 text-center sm:text-left">Nuestros Valores</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <div className="bg-surface-container-lowest p-6 rounded-3xl border border-outline-variant/20 shadow-sm hover:shadow-md transition-shadow">
                <div className="bg-primary/10 w-12 h-12 rounded-2xl flex items-center justify-center text-primary mb-4">
                  <Heart className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-lg sm:text-xl mb-2 text-on-surface">Cercanía y Comunidad</h3>
                <p className="text-on-surface-variant text-sm sm:text-base font-medium">Nacimos en el corazón de la comunidad y para la comunidad. Nos esforzamos por mantener un trato familiar, cálido y un espacio humano donde cada cliente se sienta bienvenido y comprendido.</p>
              </div>
              
              <div className="bg-surface-container-lowest p-6 rounded-3xl border border-outline-variant/20 shadow-sm hover:shadow-md transition-shadow">
                <div className="bg-primary/10 w-12 h-12 rounded-2xl flex items-center justify-center text-primary mb-4">
                  <Leaf className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-lg sm:text-xl mb-2 text-on-surface">Practicidad y Eficiencia</h3>
                <p className="text-on-surface-variant text-sm sm:text-base font-medium">Entendemos el valor de tu tiempo. Por eso, diseñamos un concepto único que simplifica tus compras: todo lo que necesitás, sin complicaciones, sin largas filas y en un solo lugar.</p>
              </div>
              
              <div className="bg-surface-container-lowest p-6 rounded-3xl border border-outline-variant/20 shadow-sm hover:shadow-md transition-shadow">
                <div className="bg-primary/10 w-12 h-12 rounded-2xl flex items-center justify-center text-primary mb-4">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-lg sm:text-xl mb-2 text-on-surface">Confianza</h3>
                <p className="text-on-surface-variant text-sm sm:text-base font-medium">Tu tranquilidad es lo primero. Garantizamos la calidad de tus compras y la seguridad en cada transacción.</p>
              </div>
              
              <div className="bg-surface-container-lowest p-6 rounded-3xl border border-outline-variant/20 shadow-sm hover:shadow-md transition-shadow">
                <div className="bg-primary/10 w-12 h-12 rounded-2xl flex items-center justify-center text-primary mb-4">
                  <Store className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-lg sm:text-xl mb-2 text-on-surface">Innovación con Propósito</h3>
                <p className="text-on-surface-variant text-sm sm:text-base font-medium">Evolucionamos constantemente para hacerte la vida más fácil. Ampliamos nuestro modelo tradicional integrando servicios clave, como el pago de facturas, para transformar el concepto de tienda de conveniencia en un verdadero centro de soluciones.</p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
