"use client"

import React, { useState } from 'react'
import {Menu, X } from 'lucide-react';
import {
  SignInButton,
  SignedIn,
  SignedOut,
  UserButton,
  useSession
} from '@clerk/nextjs'
// import { checkUserRole } from '../lib/utils';
import Link from 'next/link';



interface NavProps{
  logo: string;
}


const Nav:React.FC<NavProps> = ({ logo}) => {

  // a hook from clerk which enables to retrieve user's session data
  const { session } = useSession();
//   const userRole = checkUserRole(session);
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <nav className="bg-slate-800 relative flex px-3 text-white h-[8vh] items-center justify-between">
    {/* Logo */}
    <a className='text-pink-600' href="/">{logo}</a>

    {/* Menu burger button for mobile */}
    <button
      onClick={toggleMenu}
      className="text-white md:hidden focus:outline-none"
      aria-label="Toggle menu"
      aria-expanded={isOpen}
    >
      {/* display burger menu or closing cross */}
      {isOpen ? (
        <X className="w-6 h-6" /> 
      ) : (
        <Menu className="w-6 h-6" /> 
      )}
    </button>

    {/* Navigation links */}
    <ul className={`text-white gap-3 ${isOpen ? 'flex flex-col justify-evenly items-center absolute top-[8vh] h-[92vh] bg-slate-800 z-10 w-screen' : 'hidden'}  lg:flex`}>
        <SignedOut>
        <SignInButton />
        </SignedOut>
        <SignedIn>
        <UserButton />
        </SignedIn>
    </ul>
  </nav>
  )
}

export default Nav