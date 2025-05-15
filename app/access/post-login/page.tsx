'use client';
import { useUser } from '@clerk/nextjs';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function PostLoginRedirect() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [loading, ] = useState(true);

  useEffect(() => {
    if (!isLoaded || !user) return;

    const role = user.publicMetadata?.role;

    // Redirect after user datas were retrieved

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

  // Display spinner while user or datas are not ready
  if (loading) {
    return (
      <LoadingSpinner/>
    );
  }

  // No content after redirection was made
  return null; 
}
