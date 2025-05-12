"use client"

import { useState } from 'react'
import { toast } from 'react-hot-toast'
import Link from 'next/link'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

const ContactFormValidationSchema = z.object({
  firstName: z.string().min(2, 'Le prénom est requis'),
  lastName: z.string().min(2, 'Le nom est requis'),
  email: z.string().email('L\'email n\'est pas valide'),
  phone: z.string().min(10, 'Le téléphone doit comporter au moins 10 chiffres'),
  message: z.string().min(20, 'Votre message doit comporter au moins 20 caractères'),
  privacyPolicy: z.boolean().refine(val => val === true, 'Vous devez accepter la politique de confidentialité'),
  honeyPot: z.string().optional() 
})

type FormData = z.infer<typeof ContactFormValidationSchema>

export default function ContactPage() {
  const [isSubmitted, setIsSubmitted] = useState(false)
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(ContactFormValidationSchema)
  })

  const onSubmit = (data: FormData) => {
    if (data.honeyPot) {
      // if honeypot field is filled, it's a robot
      toast.error('Formulaire rejeté (robot détecté).')
      return
    }

    // Ici, vous pouvez envoyer les données à votre serveur ou une API
    setIsSubmitted(true)
    toast.success('Votre message a été envoyé avec succès!')
  }

  return (
    <div className="bg-custom-white text-primary">
      {/* HERO */}
      <section
        className="relative min-h-[60vh] bg-cover bg-center flex items-center justify-center text-white px-6"
        style={{ backgroundImage: 'url(/images/trowel.webp)' }} 
      >
        <div className="absolute inset-0 bg-black/50 z-0" aria-hidden="true"></div>
        <div className="relative z-10 max-w-3xl text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Contactez-Nous</h1>
          <p className="text-lg md:text-xl">
            Besoin d&apos;informations ou d&apos;un devis ? Nous sommes à votre écoute pour tous vos projets.
          </p>
        </div>
      </section>

      {/* FORMULAIRE */}
      <section className="max-w-4xl mx-auto px-6 py-16">
        <h2 className="text-2xl md:text-3xl font-semibold mb-8 text-center">Envoyez-nous un message</h2>
        
        {isSubmitted ? (
          <div className="text-center">
            <h3 className="text-xl font-semibold mb-4">Merci pour votre message !</h3>
            <p className="text-lg text-gray-700 mb-6">Nous reviendrons vers vous dans les plus brefs délais.</p>
            <Link href="/" className="text-primary hover:underline">Retour à l&apos;accueil</Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* FirstName */}
            <div className="flex gap-6">
              <div className="w-full">
                <label htmlFor="firstName" className="block text-sm font-semibold mb-2">Prénom</label>
                <input
                  id="firstName"
                  type="text"
                  {...register('firstName')}
                  className={`w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 ${errors.firstName ? 'border-red-500' : 'focus:ring-primary'}`}
                  placeholder="Votre prénom"
                />
                {errors.firstName && <p className="text-red-500 text-sm mt-2">{errors.firstName.message}</p>}
              </div>

              {/* Name */}
              <div className="w-full">
                <label htmlFor="lastName" className="block text-sm font-semibold mb-2">Nom</label>
                <input
                  id="lastName"
                  type="text"
                  {...register('lastName')}
                  className={`w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 ${errors.lastName ? 'border-red-500' : 'focus:ring-primary'}`}
                  placeholder="Votre nom"
                />
                {errors.lastName && <p className="text-red-500 text-sm mt-2">{errors.lastName.message}</p>}
              </div>
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-semibold mb-2">Votre Email</label>
              <input
                id="email"
                type="email"
                {...register('email')}
                className={`w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 ${errors.email ? 'border-red-500' : 'focus:ring-primary'}`}
                placeholder="Votre email"
              />
              {errors.email && <p className="text-red-500 text-sm mt-2">{errors.email.message}</p>}
            </div>

            {/* phone */}
            <div>
              <label htmlFor="phone" className="block text-sm font-semibold mb-2">Votre Téléphone</label>
              <input
                id="phone"
                type="tel"
                {...register('phone')}
                className={`w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 ${errors.phone ? 'border-red-500' : 'focus:ring-primary'}`}
                placeholder="Votre numéro de téléphone"
              />
              {errors.phone && <p className="text-red-500 text-sm mt-2">{errors.phone.message}</p>}
            </div>

            {/* Message */}
            <div>
              <label htmlFor="message" className="block text-sm font-semibold mb-2">Votre Message</label>
              <textarea
                id="message"
                {...register('message')}
                className={`w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 ${errors.message ? 'border-red-500' : 'focus:ring-primary'}`}
                rows={6}
                placeholder="Votre message"
              />
              {errors.message && <p className="text-red-500 text-sm mt-2">{errors.message.message}</p>}
            </div>

            {/* confidentiality policy */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="privacyPolicy"
                {...register('privacyPolicy')}
                className="h-5 w-5 text-primary focus:ring-primary"
              />
              <label htmlFor="privacyPolicy" className="text-sm">
                J’accepte la <Link href="/politique-confidentialite" className="text-primary hover:underline">politique de confidentialité</Link>.
              </label>
              {errors.privacyPolicy && <p className="text-red-500 text-sm mt-2">{errors.privacyPolicy.message}</p>}
            </div>

            {/* Honeypot */}
            <input type="text" {...register('honeyPot')} className="hidden" />

            <div className="text-center">
              <button
                type="submit"
                className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition"
              >
                Envoyer le message
              </button>
            </div>
          </form>
        )}
      </section>

      {/*  INFORMATIONS */}
      <section className="bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto text-center text-gray-700">
          <h3 className="text-2xl font-semibold mb-4">Nous trouver</h3>
          <p className="mb-4">123 Rue des Plâtriers, 67000 Strasbourg, France</p>
          <p className="mb-4">Téléphone : +33 1 23 45 67 89</p>
        </div>
      </section>

    </div>
  )
}
