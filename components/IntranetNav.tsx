'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useUser, SignOutButton } from '@clerk/nextjs';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBars,
  faChevronDown,
} from '@fortawesome/free-solid-svg-icons';
import { navItemsByRole } from '@/lib/navConfig'; 

export default function IntranetNav() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [openCategories, setOpenCategories] = useState<{ [key: string]: boolean }>({});
  const { user } = useUser();


  const role = user?.publicMetadata?.role as string;

  const items = navItemsByRole[role] || [];

  const toggleCategory = (key: string) => {
    setOpenCategories(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <>
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black opacity-50 z-20 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <header className="fixed top-0 left-0 right-0 z-40 bg-primary border-b shadow-sm md:ml-64 flex flex-col md:flex-row md:h-16">
        <div className="flex items-center justify-between w-full px-4 h-16">
          <span className="text-xl font-semibold truncate mr-2">Espace {role}</span>
          <nav>
            <SignOutButton>
              <button className="text-sm px-2 py-1 rounded whitespace-nowrap">Déconnexion</button>
            </SignOutButton>
          </nav>
        </div>
        <div className="flex md:hidden items-center w-full px-4 h-12 border-t">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded flex items-center gap-2"
          >
            <FontAwesomeIcon icon={faBars} className="text-lg" />
            <span>Menu</span>
          </button>
        </div>
      </header>

      <aside
        className={`fixed z-30 top-0 left-0 h-full w-64 bg-primary shadow-md transform transition-transform duration-300 ease-in-out pt-28
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 md:pt-0`}
      >
        <div className="h-16 flex items-center justify-center border-b font-semibold text-lg">
          Placopro
        </div>
        <nav className="p-4 space-y-2 overflow-y-auto max-h-[calc(100vh-4rem)]">
          {items.map(item =>
            item.children ? (
              <div key={item.label}>
                <button
                  onClick={() => toggleCategory(item.label)}
                  className="w-full flex justify-between items-center px-2 py-2 hover:text-secondary hover:font-bold rounded"
                >
                  <span><FontAwesomeIcon icon={item.icon} /> {item.label}</span>
                  <FontAwesomeIcon
                    icon={faChevronDown}
                    className={`transition-transform duration-200 ${openCategories[item.label] ? 'rotate-180' : ''}`}
                  />
                </button>
                {openCategories[item.label] && (
                  <ul className="pl-4 mt-1 space-y-1 text-sm">
                    {item.children.map(child => (
                      <li key={child.label}>
                        <Link href={child.href} className="block px-2 py-1 rounded hover:text-secondary hover:font-bold">
                          {child.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ) : (
              <Link
                key={item.label}
                href={item.href!}
                className="block px-2 py-2 hover:text-secondary hover:font-bold rounded"
              >
                <FontAwesomeIcon icon={item.icon} /> {item.label}
              </Link>
            )
          )}
        </nav>
      </aside>
    </>
  );
}
