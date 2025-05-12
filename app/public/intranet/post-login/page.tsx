'use client';
import { useUser } from "@clerk/nextjs";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function PostLoginRedirect() {
  const { user, isLoaded } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isLoaded) return;

    const role = user?.publicMetadata?.role;

    if (role === "directeur") {
      router.replace("/intranet/director");
    } else if (role === "secretaire") {
      router.replace("/intranet/secretary");
    } else if (role === "employe") {
      router.replace("/intranet/employee");
    } else {
      router.replace("/");
    }
  }, [isLoaded, user, router]);

  return <p>Redirection en cours...</p>;
}
