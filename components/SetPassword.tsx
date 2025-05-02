"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { setUserPassword } from "@/services/api/userService";
import { toast } from 'react-hot-toast';


export default function SetPassword({ csrfToken }: { csrfToken: string }) {
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  useEffect(() => {
    if (!token) {
      setStatus("Lien invalide ou expiré.");
    }
  }, [token]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!token) {
      setStatus("Token manquant.");
      return;
    }

    try {

      const data = await setUserPassword(password,csrfToken, token);
      if (data.success) {
        toast.success('Mot de passe créé avec succès');                 
        setStatus("Mot de passe défini avec succès.");
        router.push("/employee");
      } else {
        toast.error('Erreur lors de la création du mot de passe');                 
      }
    } catch {
      setStatus("Erreur lors de l'enregistrement du mot de passe.");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-6 max-w-md mx-auto">
      <h1 className="text-xl font-bold">Définir un mot de passe</h1>
      <input
        type="password"
        placeholder="Ton nouveau mot de passe"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        className="border p-2 w-full"
      />
      <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
        Enregistrer
      </button>
      {status && <p>{status}</p>}
    </form>
  );
}
