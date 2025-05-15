"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { toast } from "react-hot-toast";
import { passwordSchema, PasswordSchemaData } from "@/validation/passwordValidation";
import type { ZodError } from "zod";


export default function ProfileUserCustom() {
  const { user, isLoaded } = useUser();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [errors, setErrors] = useState<Partial<Record<keyof PasswordSchemaData, string>>>({});

  const [isUpdating, setIsUpdating] = useState(false);

  if (!isLoaded) return null;

  const handleSubmitPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // 1) Validation Zod
    const result = passwordSchema.safeParse({ currentPassword, newPassword, passwordConfirm });
    if (!result.success) {
      const zodErr = result.error as ZodError;
      const fieldErrors: typeof errors = {};
      zodErr.issues.forEach((issue) => {
        const key = issue.path[0] as keyof typeof fieldErrors;
        fieldErrors[key] = issue.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setIsUpdating(true);
    try {
      await user!.updatePassword({
        currentPassword,
        newPassword,
      });
      toast.success("Votre mot de passe a bien été changé !");
      setCurrentPassword("");
      setNewPassword("");
      setPasswordConfirm("");
    } catch (err: unknown) {
     let message = "Impossible de changer le mot de passe.";
      if (err instanceof Error) {
        message = err.message;
      }
      toast.error(message);

    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded shadow">

      <h1 className="text-2xl font-bold text-center mb-6">Mon profil</h1>

      {/* Informations */}
      <section className="space-y-2 mb-6">
        <h2 className="text-lg font-semibold">Mes informations</h2>
        <div>
          <label className="block text-sm font-medium">Prénom</label>
          <p className="mt-1 text-gray-700">{user?.firstName || "-"}</p>
        </div>
        <div>
          <label className="block text-sm font-medium">Nom</label>
          <p className="mt-1 text-gray-700">{user?.lastName || "-"}</p>
        </div>
        <div>
          <label className="block text-sm font-medium">Email</label>
          <p className="mt-1 text-gray-700">{user?.primaryEmailAddress?.emailAddress}</p>
        </div>
      </section>

      <form onSubmit={handleSubmitPassword} className="space-y-4">
        <div>
          <label htmlFor="currentPassword" className="block text-sm font-medium">
            Ancien mot de passe
          </label>
          <input
            id="currentPassword"
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className="mt-1 block w-full border rounded px-2 py-1"
            required
            disabled={isUpdating}
          />
          {errors.currentPassword && (
            <p className="mt-1 text-red-600 text-sm">{errors.currentPassword}</p>
          )}
        </div>

        <div>
          <label htmlFor="newPassword" className="block text-sm font-medium">
            Nouveau mot de passe
          </label>
          <input
            id="newPassword"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="mt-1 block w-full border rounded px-2 py-1"
            required
            disabled={isUpdating}
          />
          {errors.newPassword && (
            <p className="mt-1 text-red-600 text-sm">{errors.newPassword}</p>
          )}
        </div>

        <div>
          <label htmlFor="passwordConfirm" className="block text-sm font-medium">
            Confirmer mot de passe
          </label>
          <input
            id="passwordConfirm"
            type="password"
            value={passwordConfirm}
            onChange={(e) => setPasswordConfirm(e.target.value)}
            className="mt-1 block w-full border rounded px-2 py-1"
            required
            disabled={isUpdating}
          />
          {errors.passwordConfirm && (
            <p className="mt-1 text-red-600 text-sm">{errors.passwordConfirm}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isUpdating}
          className="mt-4 w-full btn btn-primary"
        >
          {isUpdating ? "En cours..." : "Changer de mot de passe"}
        </button>
      </form>
    </div>

  );
}
