'use client';
import { useUser } from '@clerk/nextjs';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function PostLoginRedirect() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [loading, ] = useState(true);

  useEffect(() => {
    if (!isLoaded || !user) return;

    const role = user.publicMetadata?.role;
    console.log("Rôle de l'utilisateur dans post-login : " + role);
    console.log("Utilisateur dans post-login : " + JSON.stringify(user));

    // Effectuer la redirection après avoir récupéré les données utilisateur

    if (role === 'directeur') {
      router.push('/intranet/director');
    } else if (role === 'secretaire') {
      router.push('/intranet/secretary');
    } else if (role === 'employe') {
      router.push('/intranet/employee');
    } else {
      router.push('/');
    }
  }, [isLoaded, user, router]);

  // Afficher le spinner pendant que l'utilisateur ou les données ne sont pas prêts
  if (loading) {
    return (
      <div className="h-[100vh] w-[100vw] bg-primary flex flex-col justify-center items-center">
        <h1 className="text-white text-xl mb-4">Chargement des données...</h1>
            <div className="flex justify-center items-center">
      <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500"></div>
    </div>
      </div>
    );
  }

  return null; // Aucun contenu une fois la redirection effectuée
}
