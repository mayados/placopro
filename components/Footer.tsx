"use client";
import Link from 'next/link'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faFacebookF, faLinkedinIn } from '@fortawesome/free-brands-svg-icons'

export default function Footer() {
  return (
<footer
  className="relative bg-primary text-custom-white pt-2"
  role="contentinfo"
  aria-labelledby="footer-heading"
>
  <h2 id="footer-heading" className="sr-only">Pied de page</h2>

  {/* Shape divider (décoratif) */}
  <div
    className="absolute inset-x-0 top-0 w-full overflow-hidden leading-none pointer-events-none"
    aria-hidden="true"
  >
    <svg
      className="relative block w-[150%] h-12 -mt-1 fill-custom-white"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 1200 120"
      preserveAspectRatio="none"
    >
      <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" />
    </svg>
  </div>

  <div className="pt-12 px-6 md:px-12 lg:px-24 pb-8">
    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
      <nav aria-labelledby="footer-nav-heading">
        <h3 id="footer-nav-heading" className="text-lg font-semibold mb-4">
          Navigation
        </h3>

        <ul className="space-y-2">
          <li>
            <Link
              href="/"
              className="flex items-center hover:text-secondary focus-visible:text-secondary"
            >
              Accueil
            </Link>
          </li>


          <li>
            <Link
              href="/realisations"
              className="flex items-center hover:text-secondary focus-visible:text-secondary"
            >
              Réalisations

            </Link>
          </li>

          <li>
            <Link
              href="/public/prestations/platrerie"
              className="flex items-center hover:text-secondary focus-visible:text-secondary"
            >
              Platrerie

            </Link>
          </li>
              <li>
                <Link
                  href="/carrelage"
                  className="hover:text-secondary focus-visible:text-secondary"
                >
                  Carrelage
                </Link>
              </li>
                          <li>
                <Link
                  href="/peinture"
                  className="hover:text-secondary focus-visible:text-secondary"
                >
                  Peinture
                </Link>
              </li>
                        <li>
            <Link
              href="/contact"
              className="flex items-center hover:text-secondary focus-visible:text-secondary"
            >
              Contact

            </Link>
          </li>


        </ul>
      </nav>

      <section aria-labelledby="footer-social-heading">
        <h3 id="footer-social-heading" className="text-lg font-semibold mb-4">
          Suivez-nous
        </h3>

        <ul className="flex space-x-4">
          <li>
            <a
              href="#"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-secondary focus-visible:text-secondary"
              aria-label="Facebook"
            >
              <FontAwesomeIcon
                icon={faFacebookF}
                className="w-5 h-5"
                aria-hidden="true"
              />
            </a>
          </li>
          <li>
            <a
              href="#"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-secondary focus-visible:text-secondary"
              aria-label="LinkedIn"
            >
              <FontAwesomeIcon
                icon={faLinkedinIn}
                className="w-5 h-5"
                aria-hidden="true"
              />
            </a>
          </li>
        </ul>
      </section>

      <section aria-labelledby="footer-legal-heading">
        <h3 id="footer-legal-heading" className="text-lg font-semibold mb-4">
          Informations légales
        </h3>

        <ul className="space-y-2">
          <li>
            <Link
              href="/cgv"
              className="hover:text-secondary focus-visible:text-secondary"
            >
              CGV
            </Link>
          </li>
          <li>
            <Link
              href="/confidentialite"
              className="hover:text-secondary focus-visible:text-secondary"
            >
              Politique&nbsp;de&nbsp;confidentialité
            </Link>
          </li>
          <li>
            <Link
              href="/mentions-legales"
              className="hover:text-secondary focus-visible:text-secondary"
            >
              Mentions&nbsp;légales
            </Link>
          </li>
        </ul>
      </section>

      <address
        aria-labelledby="footer-contact-heading"
        className="not-italic text-sm leading-relaxed space-y-1"
      >
        <h3 id="footer-contact-heading" className="text-lg font-semibold mb-4">
          Coordonnées
        </h3>

        <p>Placopro</p>
        <p>123&nbsp;Rue&nbsp;Exemple</p>
        <p>67000 Strasbourg</p>
        <p>
          Tél.&nbsp;:&nbsp;
          <a
            href="tel:+33123456789"
            className="hover:text-secondary focus-visible:text-secondary"
          >
            06&nbsp;06&nbsp;06&nbsp;&nbsp;06
          </a>
        </p>
      </address>
    </div>

    <div className="mt-8 border-t border-custom-white/40 pt-4 text-center text-sm">
      © {new Date().getFullYear()} Placopro. Tous droits réservés.
    </div>
  </div>
</footer>



  )
}
