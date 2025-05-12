'use client'

import { useForm } from 'react-hook-form'
import { z, ZodError } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useSignIn } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'
import { useState } from 'react'

const loginSchema = z.object({
  email: z.string().email({ message: "Adresse e-mail invalide" }),
  password: z.string().min(6, { message: "Mot de passe trop court" }),
})

type LoginSchema = z.infer<typeof loginSchema>

export default function LoginPage() {
  const { register, handleSubmit, formState: { errors } } = useForm<LoginSchema>({
    resolver: zodResolver(loginSchema),
  })
  const { signIn, isLoaded } = useSignIn()
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const onSubmit = async (data: LoginSchema) => {
    if (!isLoaded) return
    setLoading(true)

    try {
      const result = await signIn.create({
        identifier: data.email,
        password: data.password,
      })

      if (result.status === 'complete') {
        toast.success('Connexion réussie')

  
          router.push('/intranet/post-login');
      }
    } catch (err: unknown) {
       // Si c'est une erreur Zod, on affiche ses messages
        if (err instanceof ZodError) {
          const first = err.errors[0]
          toast.error(first.message)
        }
        // Si c'est une erreur réseau ou autre Error native
        else if (err instanceof Error) {
          toast.error(err.message)
        }
        // Cas fallback
        else {
          toast.error('Erreur inattendue lors de la connexion')
        }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-custome-white px-4">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-primary p-8 rounded shadow-md w-full max-w-md space-y-6"
      >
        <h1 className="text-2xl font-bold text-center">Connexion</h1>

        <div>
          <label className="block text-sm font-medium">Email</label>
          <input
            type="email"
            {...register('email')}
            className="w-full mt-1 px-4 py-2 border rounded"
          />
          {errors.email && (
            <p className="text-sm text-red-600 mt-1">{errors.email.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium">Mot de passe</label>
          <input
            type="password"
            {...register('password')}
            className="w-full mt-1 px-4 py-2 border rounded"
          />
          {errors.password && (
            <p className="text-sm text-red-600 mt-1">{errors.password.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-primary text-white py-2 rounded hover:bg-primary/90 transition"
        >
          {loading ? 'Connexion...' : 'Se connecter'}
        </button>

        <p className="text-sm text-center">
          <a href="/forgot-password" className="text-primary hover:underline">
            Mot de passe oublié ?
          </a>
        </p>
      </form>
    </div>
  )
}
