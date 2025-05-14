'use client'

import React, { useState } from 'react'
import { Menu, X, ChevronDown } from 'lucide-react'
import Link from 'next/link'


interface NavProps {
  logo: string
}

const Nav: React.FC<NavProps> = ({ logo }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [isSubMenuOpen, setIsSubMenuOpen] = useState(false)

  const toggleMenu = () => setIsOpen(!isOpen)
  const toggleSubMenu = () => setIsSubMenuOpen(!isSubMenuOpen)

  return (
    <nav className="fixed top-0 left-0 w-full bg-custom-white/90 backdrop-blur-md px-4 h-[8vh] flex items-center justify-between z-50 text-primary shadow-md">
      {/* Logo */}
      <Link href="/" className="font-bold text-xl">{logo}</Link>

      {/* Mobile burger */}
      <button
        onClick={toggleMenu}
        className="md:hidden"
        aria-label="Toggle menu"
        aria-expanded={isOpen}
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Navigation links */}
      <ul
        className={`
          ${isOpen ? 'flex' : 'hidden'}
          md:flex
          flex-col md:flex-row
          md:static absolute
          top-[8vh] left-0
          w-full md:w-auto
          ${isOpen ? 'h-[92vh]' : 'h-0'}
          bg-custom-white md:bg-transparent
          md:space-x-6
          text-center md:text-left
          items-center
          py-6 md:py-0
          text-primary
          z-40
          space-y-6 md:space-y-0
          text-lg
        `}
      >
        <li><Link href="/" className="hover:text-gray-400 transition">Accueil</Link></li>

        {/* Dropdown Prestations */}
        <li className="relative">
          <button
            onClick={toggleSubMenu}
            className="flex items-center hover:text-gray-400 transition"
          >
            Prestations <ChevronDown className="ml-1 w-4 h-4" />
          </button>
          <ul
            className={`
              ${isSubMenuOpen ? 'block' : 'hidden'}
              md:absolute md:top-full md:left-0
              bg-slate-700 rounded-md mt-2 md:mt-0
              text-sm md:w-40 space-y-2 md:space-y-0 md:py-2
              text-white
            `}
          >
            <li><Link href="/public/prestations/platrerie" className="block px-4 py-2 hover:bg-slate-600">Plâtrerie</Link></li>
            <li><Link href="/public/prestations/carrelage" className="block px-4 py-2 hover:bg-slate-600">Carrelage</Link></li>
            <li><Link href="/public/prestations/peinture" className="block px-4 py-2 hover:bg-slate-600">Peinture</Link></li>
          </ul>
        </li>
        <li><Link href="/" className="hover:text-gray-400 transition">Réalisations</Link></li>

        <li><Link href="public/contact" className="hover:text-gray-400 transition">Contact</Link></li>

      </ul>
    </nav>
  )
}

export default Nav
