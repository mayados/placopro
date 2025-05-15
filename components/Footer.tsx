"use client";
import Link from 'next/link'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faFacebookF } from '@fortawesome/free-brands-svg-icons'
import { faChevronRight } from '@fortawesome/free-solid-svg-icons'
import { SignedIn, SignedOut, UserButton } from '@clerk/nextjs'

export default function Footer() {
  return (
    <footer className="relative bg-primary text-custom-white pt-2">
      {/* Shape divider */}
      <div className="absolute inset-x-0 top-0 w-full overflow-hidden leading-none pointer-events-none">
        <svg
          className="relative block w-[150%] h-12 -mt-1 fill-custom-white"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" />
        </svg>
      </div>

      <div className="pt-12 px-6 md:px-12 lg:px-24 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Liens de navigation */}
          <nav aria-label="Navigation principale du pied de page">
            <h2 className="text-lg font-semibold mb-4">Navigation</h2>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="flex items-center hover:text-primary">
                  Accueil <FontAwesomeIcon icon={faChevronRight} className="ml-2 w-3 h-3" />
                </Link>
              </li>
              <li>
                <Link href="/devis" className="flex items-center hover:text-primary">
                  Estimation de devis <FontAwesomeIcon icon={faChevronRight} className="ml-2 w-3 h-3" />
                </Link>
              </li>
              <li>
                <Link href="/realisations" className="flex items-center hover:text-primary">
                  Réalisations <FontAwesomeIcon icon={faChevronRight} className="ml-2 w-3 h-3" />
                </Link>
              </li>
              <li>
                <button
                  onClick={() => {}}
                  className="w-full text-left flex items-center hover:text-primary"
                  aria-haspopup="true"
                  aria-expanded="false"
                >
                  Prestations <FontAwesomeIcon icon={faChevronRight} className="ml-2 w-3 h-3" />
                </button>
                <ul className="mt-1 ml-4 space-y-1">
                  <li>
                    <Link href="/platrerie" className="hover:text-primary">
                      Plâtrerie
                    </Link>
                  </li>
                  <li>
                    <Link href="/carrelage" className="hover:text-primary">
                      Carrelage
                    </Link>
                  </li>
                  <li>
                    <Link href="/peinture" className="hover:text-primary">
                      Peinture
                    </Link>
                  </li>
                </ul>
              </li>
              <li>
                <Link href="/contact" className="flex items-center hover:text-primary">
                  Contact <FontAwesomeIcon icon={faChevronRight} className="ml-2 w-3 h-3" />
                </Link>
              </li>
              <li>
                <SignedOut>
                  <Link href="/signin" className="flex items-center hover:text-primary">
                    Accéder à l’intranet <FontAwesomeIcon icon={faChevronRight} className="ml-2 w-3 h-3" />
                  </Link>
                </SignedOut>
                <SignedIn>
                  <UserButton />
                </SignedIn>
              </li>
            </ul>
          </nav>

          {/* Lien externes & réseaux */}
          <div>
            <h2 className="text-lg font-semibold mb-4">Suivez-nous</h2>
            <ul className="flex space-x-4">
              <li>
                <a
                  href="https://www.facebook.com/votrepage"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-primary"
                  aria-label="Facebook"
                >
                  <FontAwesomeIcon icon={faFacebookF} className="w-5 h-5" />
                </a>
              </li>
              {/* ajouter d'autres réseaux ici */}
            </ul>
          </div>

          {/* Liens légaux */}
          <div>
            <h2 className="text-lg font-semibold mb-4">Informations légales</h2>
            <ul className="space-y-2">
              <li>
                <Link href="/cgv" className="hover:text-primary">
                  CGV
                </Link>
              </li>
              <li>
                <Link href="/confidentialite" className="hover:text-primary">
                  Politique de confidentialité
                </Link>
              </li>
              <li>
                <Link href="/mentions-legales" className="hover:text-primary">
                  Mentions légales
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-custom-white/40 pt-4 text-center text-sm">
          © {new Date().getFullYear()} Placopro. Tous droits réservés.
        </div>
      </div>
    </footer>
  )
}
