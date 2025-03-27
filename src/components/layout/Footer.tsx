import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Registrar el plugin ScrollTrigger
gsap.registerPlugin(ScrollTrigger);

const Footer = () => {
  // Animaciones con GSAP
  useEffect(() => {
    const footerElements = document.querySelectorAll('.footer-animate');

    footerElements.forEach((element) => {
      gsap.fromTo(
        element,
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: element,
            start: 'top 90%',
            toggleActions: 'play none none none'
          }
        }
      );
    });
  }, []);

  // Animación para hover en elementos
  const handleMouseEnter = (e: React.MouseEvent<HTMLElement>) => {
    gsap.to(e.currentTarget, {
      scale: 1.05,
      color: 'var(--hover)',
      duration: 0.3,
      ease: 'power2.out'
    });
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLElement>) => {
    gsap.to(e.currentTarget, {
      scale: 1,
      color: '',
      duration: 0.3,
      ease: 'power2.out'
    });
  };

  return (
    <footer className="bg-oscuro text-white pt-12 pb-6">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Acerca de */}
          <div className="footer-animate">
            <h3 className="text-xl font-semibold mb-4 text-secundario">Flores INC</h3>
            <p className="mb-4 text-claro">
              ¡Bienvenido al fantástico mundo de Flores Inc, donde los sueños y la naturaleza se fusionan en una experiencia única! Somos mucho más que una simple empresa, somos los guardianes de la magia verde y estamos aquí para llevar tu exploración de la marihuana a nuevas alturas.
            </p>
            <div className="flex space-x-4">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-claro hover:text-acento transition-colors"
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
              >
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
                </svg>
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-claro hover:text-acento transition-colors"
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
              >
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" />
                </svg>
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-claro hover:text-acento transition-colors"
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
              >
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723 10.054 10.054 0 01-3.127 1.184 4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Enlaces legales */}
          <div className="footer-animate">
            <h3 className="text-xl font-semibold mb-4 text-secundario">Legal</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/terminos"
                  className="text-claro hover:text-acento transition-colors text-sm"
                  onMouseEnter={handleMouseEnter}
                  onMouseLeave={handleMouseLeave}
                  onClick={() => {
                    // Desplazar hacia arriba al hacer clic
                    window.scrollTo({
                      top: 0,
                      behavior: 'smooth'
                    });
                  }}
                >
                  Términos y condiciones
                </Link>
              </li>
              <li>
                <Link
                  to="/privacidad"
                  className="text-claro hover:text-acento transition-colors text-sm"
                  onMouseEnter={handleMouseEnter}
                  onMouseLeave={handleMouseLeave}
                  onClick={() => {
                    // Desplazar hacia arriba al hacer clic
                    window.scrollTo({
                      top: 0,
                      behavior: 'smooth'
                    });
                  }}
                >
                  Política de privacidad
                </Link>
              </li>
              <li>
                <Link
                  to="/cookies"
                  className="text-claro hover:text-acento transition-colors text-sm"
                  onMouseEnter={handleMouseEnter}
                  onMouseLeave={handleMouseLeave}
                  onClick={() => {
                    // Desplazar hacia arriba al hacer clic
                    window.scrollTo({
                      top: 0,
                      behavior: 'smooth'
                    });
                  }}
                >
                  Política de cookies
                </Link>
              </li>
              <li>
                <Link
                  to="/devoluciones"
                  className="text-claro hover:text-acento transition-colors text-sm"
                  onMouseEnter={handleMouseEnter}
                  onMouseLeave={handleMouseLeave}
                  onClick={() => {
                    // Desplazar hacia arriba al hacer clic
                    window.scrollTo({
                      top: 0,
                      behavior: 'smooth'
                    });
                  }}
                >
                  Política de devoluciones
                </Link>
              </li>
            </ul>
          </div>

          {/* Contacto */}
          <div className="footer-animate">
            <h3 className="text-xl font-semibold mb-4 text-secundario">Contacto</h3>
            <ul className="space-y-3">
              <li className="flex items-start">
                <svg className="h-6 w-6 mr-2 text-secundario" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="text-claro">Unicamente ventas online.</span>
              </li>
              <li className="flex items-start">
                <svg className="h-6 w-6 mr-2 text-secundario" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <span className="text-claro">+57 322 323 7785</span>
              </li>
              <li className="flex items-start">
                <svg className="h-6 w-6 mr-2 text-secundario" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span className="text-claro">info@floresinc.com</span>
              </li>
              <li className="flex items-start">
                <svg className="h-6 w-6 mr-2 text-secundario" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="text-claro">
                  <p>Lun - Vie: 24/7</p>
                  <p>Sáb - Dom: 10:00 - 15:00</p>
                </div>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div className="footer-animate">
            <h3 className="text-xl font-semibold mb-4 text-secundario">Newsletter</h3>
            <p className="mb-4 text-claro">
              Suscríbete para recibir nuestras últimas novedades y ofertas especiales.
            </p>
            <form className="space-y-3">
              <div>
                <input
                  type="email"
                  placeholder="Tu correo electrónico"
                  className="w-full px-4 py-2 rounded-md bg-white/10 border border-secundario/30 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-acento"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-primario hover:bg-hover text-white font-medium py-2 px-4 rounded-md transition-colors duration-300"
              >
                Suscribirse
              </button>
            </form>
          </div>
        </div>

        {/* Línea divisoria */}
        <div className="border-t border-secundario/30 mt-10 pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-claro text-sm mb-4 md:mb-0">
              &copy; {new Date().getFullYear()} Flores INC. Todos los derechos reservados.
            </p>
            <div className="flex space-x-4">
              <Link
                to="/terminos"
                className="text-claro hover:text-acento text-sm transition-colors"
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
              >
                Términos y condiciones
              </Link>
              <Link
                to="/privacidad"
                className="text-claro hover:text-acento text-sm transition-colors"
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
              >
                Política de privacidad
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
