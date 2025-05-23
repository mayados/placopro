"use client"

import { useSignIn } from '@clerk/nextjs'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import { useState } from 'react'

// Schéma de validation
const schema = z.object({
  email: z.string().email("Adresse email invalide"),
})
console.log("test")
console.log("test test ")
console.log("test ecnore ")

type FormValues = z.infer<typeof schema>

export default function ForgotPasswordForm() {
  const { signIn } = useSignIn()
  const [success, setSuccess] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<FormValues>({
    resolver: zodResolver(schema)
  })

  const onSubmit = async (data: FormValues) => {
    try {
      await signIn?.create({
        strategy: 'reset_password_email_code',
        identifier: data.email,
      })
      setSuccess(true)
      toast.success("Un email de réinitialisation a été envoyé.")
    } catch (err) {
      console.error(err)
      toast.error("Impossible d'envoyer le lien. Vérifie l'email.")
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-md mx-auto">
      <input
        type="email"
        placeholder="Adresse e-mail"
        {...register("email")}
        className="input input-bordered w-full"
      />
      {errors.email && <p className="text-red-500">{errors.email.message}</p>}

      <button
        type="submit"
        disabled={isSubmitting}
        className="btn btn-primary w-full"
      >
        Envoyer le lien
      </button>

      {success && (
        <p className="text-green-600 mt-2">
          Vérifiez vos emails pour poursuivre la réinitialisation.
        </p>
      )}
    </form>
  )
}
