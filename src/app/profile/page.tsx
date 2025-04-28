"use client"
import { useState, useEffect, useMemo } from "react"
import { useUser } from "@clerk/nextjs"
import { useGetUserByClerkIdQuery } from "@/app/state/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/app/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/app/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useToast } from "@/components/ui/use-toast"
import {
  Loader2,
  Save,
  User,
  Briefcase,
  Award,
  MapPin,
  Mail,
  Phone,
  Calendar,
  Globe,
  Check,
  ChevronDown,
  ExternalLink,
  Camera,
} from "lucide-react"
import { useUpdateUserProfileMutation } from "@/app/state/api"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

// Liste des pays avec leurs codes téléphoniques et drapeaux
const countries = [
  { name: "France", code: "FR", dialCode: "+33", flag: "🇫🇷" },
  { name: "Tunisie", code: "TN", dialCode: "+216", flag: "🇹🇳" },
  { name: "États-Unis", code: "US", dialCode: "+1", flag: "🇺🇸" },
  { name: "Canada", code: "CA", dialCode: "+1", flag: "🇨🇦" },
  { name: "Royaume-Uni", code: "GB", dialCode: "+44", flag: "🇬🇧" },
  { name: "Allemagne", code: "DE", dialCode: "+49", flag: "🇩🇪" },
  { name: "Espagne", code: "ES", dialCode: "+34", flag: "🇪🇸" },
  { name: "Italie", code: "IT", dialCode: "+39", flag: "🇮🇹" },
  { name: "Maroc", code: "MA", dialCode: "+212", flag: "🇲🇦" },
  { name: "Algérie", code: "DZ", dialCode: "+213", flag: "🇩🇿" },
  { name: "Belgique", code: "BE", dialCode: "+32", flag: "🇧🇪" },
  { name: "Suisse", code: "CH", dialCode: "+41", flag: "🇨🇭" },
]

// Configuration des réseaux sociaux avec leurs couleurs et icônes
const socialNetworks = [
  {
    name: "website",
    label: "Site Web",
    placeholder: "https://votresite.com",
    icon: <Globe className="w-5 h-5" />,
    color: "bg-gradient-to-r from-blue-500 to-cyan-500",
    textColor: "text-white",
  },
  {
    name: "linkedin",
    label: "LinkedIn",
    placeholder: "https://linkedin.com/in/votrenom",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="#0A66C2">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      </svg>
    ),
    color: "bg-[#0A66C2]",
    textColor: "text-white",
  },
  {
    name: "github",
    label: "GitHub",
    placeholder: "https://github.com/votrenom",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
      </svg>
    ),
    color: "bg-gray-900",
    textColor: "text-white",
  },
  {
    name: "twitter",
    label: "Twitter",
    placeholder: "https://twitter.com/votrenom",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="#1DA1F2">
        <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
      </svg>
    ),
    color: "bg-[#1DA1F2]",
    textColor: "text-white",
  },
  
  {
    name: "instagram",
    label: "Instagram",
    placeholder: "https://instagram.com/votrenom",
    icon: (
      <div className="flex items-center justify-center w-5 h-5 bg-gradient-to-tr from-yellow-500 via-pink-500 to-purple-500 rounded-md">
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="white">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
        </svg>
      </div>
    ),
    color: "bg-gradient-to-tr from-yellow-500 via-pink-500 to-purple-500",
    textColor: "text-white",
  },
]

export default function ProfilePage() {
  const { user } = useUser()
  const { toast } = useToast()
  const clerkUserId = user?.id

  const {
    data: userData,
    isLoading,
    error,
    refetch,
  } = useGetUserByClerkIdQuery(clerkUserId, {
    skip: !clerkUserId,
  })

  const [updateUserProfile, { isLoading: isUpdating }] = useUpdateUserProfileMutation()

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    bio: "",
    jobTitle: "",
    company: "",
    location: "",
    phone: "",
    phoneCountry: "FR",
    skills: "",
    website: "",
    linkedin: "",
    github: "",
    twitter: "",
    facebook: "",
    instagram: "",
  })

  const [selectedCountry, setSelectedCountry] = useState(countries[0])
  const [phoneNumber, setPhoneNumber] = useState("")

  useEffect(() => {
    if (userData?.user) {
      // Extraire le code pays du numéro de téléphone s'il existe
      let countryCode = "FR"
      let phoneWithoutCode = userData.user.phone || ""

      for (const country of countries) {
        if (phoneWithoutCode.startsWith(country.dialCode)) {
          countryCode = country.code
          phoneWithoutCode = phoneWithoutCode.substring(country.dialCode.length).trim()
          break
        }
      }

      const foundCountry = countries.find((c) => c.code === countryCode) || countries[0]
      setSelectedCountry(foundCountry)
      setPhoneNumber(phoneWithoutCode)

      setFormData({
        name: userData.user.name || "",
        email: userData.user.email || "",
        bio: userData.user.bio || "",
        jobTitle: userData.user.job_title || "",
        company: userData.user.company || "",
        location: userData.user.location || "",
        phone: userData.user.phone || "",
        phoneCountry: countryCode,
        skills: userData.user.skills || "",
        website: userData.user.website || "",
        linkedin: userData.user.linkedin || "",
        github: userData.user.github || "",
        twitter: userData.user.twitter || "",
        facebook: userData.user.facebook || "",
        instagram: userData.user.instagram || "",
      })
    }
  }, [userData])

  const handleChange = (e: { target: { name: any; value: any } }) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handlePhoneChange = (value: string) => {
    setPhoneNumber(value)
    setFormData((prev) => ({
      ...prev,
      phone: `${selectedCountry.dialCode} ${value}`,
    }))
  }

  const handleCountryChange = (countryCode: string) => {
    const country = countries.find((c) => c.code === countryCode) || countries[0]
    setSelectedCountry(country)
    setFormData((prev) => ({
      ...prev,
      phoneCountry: countryCode,
      phone: `${country.dialCode} ${phoneNumber}`,
    }))
  }

  const handleSubmit = async (e: { preventDefault: () => void }) => {
    e.preventDefault()

    if (!clerkUserId) return

    try {
      await updateUserProfile({
        clerkUserId,
        ...formData,
      }).unwrap()

      toast({
        title: "Profil mis à jour",
        description: "Vos informations ont été enregistrées avec succès.",
        variant: "default",
      })

      refetch()
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la mise à jour du profil.",
        variant: "destructive",
      })
      console.error("Erreur lors de la mise à jour:", error)
    }
  }

  // Extraire les compétences sous forme de tableau
  const skillsArray = useMemo(() => {
    return formData.skills
      ? formData.skills
          .split(",")
          .map((skill) => skill.trim())
          .filter(Boolean)
      : []
  }, [formData.skills])

  // Vérifier si un lien social est rempli
  const hasSocialLink = (name: string) => {
    return formData[name as keyof typeof formData] && formData[name as keyof typeof formData].length > 0
  }

  // Obtenir les liens sociaux remplis
  const filledSocialLinks = useMemo(() => {
    return socialNetworks.filter((network) => hasSocialLink(network.name))
  }, [formData])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-50 to-white dark:from-gray-900 dark:to-gray-800">
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 rounded-full border-4 border-purple-200 dark:border-purple-900 opacity-25"></div>
            <div className="absolute inset-0 rounded-full border-4 border-t-purple-600 dark:border-t-purple-400 animate-spin"></div>
          </div>
          <p className="text-lg font-medium text-purple-700 dark:text-purple-300">Chargement de votre profil...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-50 to-white dark:from-gray-900 dark:to-gray-800">
        <div className="text-center max-w-md p-8 rounded-xl bg-white dark:bg-gray-800 shadow-xl">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8 text-red-600 dark:text-red-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Erreur lors du chargement du profil</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Nous n'avons pas pu récupérer vos informations. Veuillez réessayer ultérieurement.
          </p>
          <Button onClick={() => window.location.reload()} className="bg-purple-600 hover:bg-purple-700">
            Réessayer
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-white dark:from-gray-900 dark:to-gray-800 py-12 px-4 sm:px-6">
      <div className="container max-w-6xl mx-auto">
        {/* En-tête avec effet de glassmorphism */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative mb-10 p-8 rounded-2xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg shadow-xl border border-purple-100 dark:border-purple-900/30"
        >
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-purple-500/5 to-indigo-500/5 rounded-2xl pointer-events-none"></div>
          <div className="absolute -top-4 -right-4 w-24 h-24 bg-purple-200 dark:bg-purple-900/30 rounded-full blur-2xl opacity-60 pointer-events-none"></div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
            <div className="flex items-center gap-6">
              <div className="relative group">
                <Avatar className="w-24 h-24 border-4 border-white dark:border-gray-700 shadow-lg">
                  <AvatarImage src={user?.imageUrl || "/placeholder.svg"} alt={formData.name} />
                  <AvatarFallback className="bg-gradient-to-br from-purple-600 to-indigo-600 text-white text-2xl">
                    {formData.name?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer">
                  <Camera className="w-6 h-6 text-white" />
                </div>
              </div>

              <div>
                <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-indigo-600">
                  {formData.name || "Votre Profil"}
                </h1>
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  {formData.jobTitle && (
                    <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 hover:bg-purple-200 dark:hover:bg-purple-800">
                      {formData.jobTitle}
                    </Badge>
                  )}
                  {formData.company && (
                    <Badge className="bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200 hover:bg-indigo-200 dark:hover:bg-indigo-800">
                      {formData.company}
                    </Badge>
                  )}
                  {formData.location && (
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                      <MapPin className="w-4 h-4 mr-1" />
                      {formData.location}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <Button
              onClick={handleSubmit}
              disabled={isUpdating}
              className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-md hover:shadow-lg transition-all duration-200"
            >
              {isUpdating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Enregistrement...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Enregistrer les modifications
                </>
              )}
            </Button>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Colonne de gauche - Informations de base */}
          <div className="lg:col-span-1 space-y-8">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <Card className="overflow-hidden border-0 shadow-xl bg-white dark:bg-gray-800">
                <div className="h-2 bg-gradient-to-r from-purple-600 to-indigo-600"></div>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <User className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    Informations personnelles
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {formData.bio && (
                    <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg border border-purple-100 dark:border-purple-800/30">
                      <p className="text-gray-700 dark:text-gray-200 italic">"{formData.bio}"</p>
                    </div>
                  )}

                  <div className="space-y-4">
                    <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/80 transition-colors">
                      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                        <Mail className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Email</p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{formData.email}</p>
                      </div>
                    </div>

                    {formData.phone && (
                      <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/80 transition-colors">
                        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                          <Phone className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Téléphone</p>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{formData.phone}</p>
                        </div>
                      </div>
                    )}

                    {formData.location && (
                      <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/80 transition-colors">
                        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                          <MapPin className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Localisation</p>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{formData.location}</p>
                        </div>
                      </div>
                    )}

                    {formData.jobTitle && (
                      <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/80 transition-colors">
                        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                          <Briefcase className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Poste</p>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{formData.jobTitle}</p>
                        </div>
                      </div>
                    )}

                    {formData.company && (
                      <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/80 transition-colors">
                        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                          <Award className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Entreprise</p>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{formData.company}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {userData?.user?.created_at && (
                    <div className="flex items-center gap-2 pt-4 border-t border-gray-200 dark:border-gray-700 text-sm text-gray-500 dark:text-gray-400">
                      <Calendar className="w-4 h-4" />
                      <span>Membre depuis {new Date(userData.user.created_at).toLocaleDateString()}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Compétences */}
            {skillsArray.length > 0 && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <Card className="overflow-hidden border-0 shadow-xl bg-white dark:bg-gray-800">
                  <div className="h-2 bg-gradient-to-r from-indigo-600 to-purple-600"></div>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-xl">
                      <Award className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                      Compétences
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {skillsArray.map((skill, index) => (
                        <Badge
                          key={index}
                          className="bg-gradient-to-r from-purple-100 to-indigo-100 text-purple-800 dark:from-purple-900/40 dark:to-indigo-900/40 dark:text-purple-300 hover:from-purple-200 hover:to-indigo-200 dark:hover:from-purple-900/60 dark:hover:to-indigo-900/60"
                        >
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Réseaux sociaux */}
            {filledSocialLinks.length > 0 && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <Card className="overflow-hidden border-0 shadow-xl bg-white dark:bg-gray-800">
                  <div className="h-2 bg-gradient-to-r from-purple-600 to-indigo-600"></div>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-xl">
                      <Globe className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                      Réseaux sociaux
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-3">
                      {filledSocialLinks.map((network) => {
                        const url = formData[network.name as keyof typeof formData] as string
                        return (
                          <a
                            key={network.name}
                            href={url.startsWith("http") ? url : `https://${url}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={cn(
                              "flex items-center gap-2 px-4 py-2 rounded-full transition-transform hover:scale-105",
                              network.color,
                              network.textColor,
                            )}
                          >
                            <span className="flex-shrink-0">{network.icon}</span>
                            <span className="text-sm font-medium">{network.label}</span>
                            <ExternalLink className="w-3 h-3 ml-1 opacity-70" />
                          </a>
                        )
                      })}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </div>

          {/* Colonne de droite - Formulaire d'édition */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="lg:col-span-2"
          >
            <Card className="border-0 shadow-xl bg-white dark:bg-gray-800">
              <CardHeader>
                <CardTitle className="text-xl text-purple-800 dark:text-purple-300">Modifier votre profil</CardTitle>
                <CardDescription>
                  Mettez à jour vos informations professionnelles pour compléter votre profil
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="personal" className="w-full">
                  <TabsList className="grid w-full grid-cols-3 mb-8 bg-purple-100 dark:bg-gray-700/50">
                    <TabsTrigger
                      value="personal"
                      className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 data-[state=active]:text-purple-700 dark:data-[state=active]:text-purple-300 data-[state=active]:shadow-sm"
                    >
                      Personnel
                    </TabsTrigger>
                    <TabsTrigger
                      value="professional"
                      className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 data-[state=active]:text-purple-700 dark:data-[state=active]:text-purple-300 data-[state=active]:shadow-sm"
                    >
                      Professionnel
                    </TabsTrigger>
                    <TabsTrigger
                      value="social"
                      className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 data-[state=active]:text-purple-700 dark:data-[state=active]:text-purple-300 data-[state=active]:shadow-sm"
                    >
                      Réseaux sociaux
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="personal" className="space-y-6 mt-4">
                    <div className="grid gap-6">
                      <div className="grid gap-2">
                        <Label htmlFor="name" className="text-purple-800 dark:text-purple-300">
                          Nom complet
                        </Label>
                        <Input
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          placeholder="Votre nom complet"
                          className="border-purple-200 dark:border-purple-900/50 focus:border-purple-500 focus:ring-purple-500"
                        />
                      </div>

                      <div className="grid gap-2">
                        <Label htmlFor="email" className="text-purple-800 dark:text-purple-300">
                          Email
                        </Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleChange}
                          placeholder="votre.email@exemple.com"
                          className="border-purple-200 dark:border-purple-900/50 focus:border-purple-500 focus:ring-purple-500"
                        />
                      </div>

                      <div className="grid gap-2">
                        <Label htmlFor="phone" className="text-purple-800 dark:text-purple-300">
                          Téléphone
                        </Label>
                        <div className="flex">
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                role="combobox"
                                className="flex-shrink-0 w-auto gap-1 border-r-0 rounded-r-none border-purple-200 dark:border-purple-900/50"
                              >
                                <span className="text-lg">{selectedCountry.flag}</span>
                                <span className="text-xs text-gray-600 dark:text-gray-300">
                                  {selectedCountry.dialCode}
                                </span>
                                <ChevronDown className="w-4 h-4 ml-1 opacity-50" />
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-[200px] p-0 max-h-[300px] overflow-y-auto">
                              <div className="grid">
                                {countries.map((country) => (
                                  <Button
                                    key={country.code}
                                    variant="ghost"
                                    className="flex items-center justify-start gap-2 px-2 py-1.5 text-sm"
                                    onClick={() => handleCountryChange(country.code)}
                                  >
                                    <span className="text-lg">{country.flag}</span>
                                    <span>{country.name}</span>
                                    <span className="ml-auto text-xs text-gray-500">{country.dialCode}</span>
                                    {country.code === selectedCountry.code && (
                                      <Check className="w-4 h-4 ml-2 text-purple-600 dark:text-purple-400" />
                                    )}
                                  </Button>
                                ))}
                              </div>
                            </PopoverContent>
                          </Popover>
                          <Input
                            id="phone"
                            value={phoneNumber}
                            onChange={(e) => handlePhoneChange(e.target.value)}
                            placeholder="Numéro de téléphone"
                            className="flex-grow rounded-l-none border-purple-200 dark:border-purple-900/50 focus:border-purple-500 focus:ring-purple-500"
                          />
                        </div>
                      </div>

                      <div className="grid gap-2">
                        <Label htmlFor="location" className="text-purple-800 dark:text-purple-300">
                          Localisation
                        </Label>
                        <Input
                          id="location"
                          name="location"
                          value={formData.location}
                          onChange={handleChange}
                          placeholder="Paris, France"
                          className="border-purple-200 dark:border-purple-900/50 focus:border-purple-500 focus:ring-purple-500"
                        />
                      </div>

                      <div className="grid gap-2">
                        <Label htmlFor="bio" className="text-purple-800 dark:text-purple-300">
                          Biographie
                        </Label>
                        <Textarea
                          id="bio"
                          name="bio"
                          value={formData.bio}
                          onChange={handleChange}
                          placeholder="Parlez-nous de vous en quelques mots..."
                          rows={4}
                          className="border-purple-200 dark:border-purple-900/50 focus:border-purple-500 focus:ring-purple-500"
                        />
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="professional" className="space-y-6 mt-4">
                    <div className="grid gap-6">
                      <div className="grid gap-2">
                        <Label htmlFor="jobTitle" className="text-purple-800 dark:text-purple-300">
                          Titre du poste
                        </Label>
                        <Input
                          id="jobTitle"
                          name="jobTitle"
                          value={formData.jobTitle}
                          onChange={handleChange}
                          placeholder="Développeur Full Stack"
                          className="border-purple-200 dark:border-purple-900/50 focus:border-purple-500 focus:ring-purple-500"
                        />
                      </div>

                      <div className="grid gap-2">
                        <Label htmlFor="company" className="text-purple-800 dark:text-purple-300">
                          Entreprise
                        </Label>
                        <Input
                          id="company"
                          name="company"
                          value={formData.company}
                          onChange={handleChange}
                          placeholder="Nom de votre entreprise"
                          className="border-purple-200 dark:border-purple-900/50 focus:border-purple-500 focus:ring-purple-500"
                        />
                      </div>

                      <div className="grid gap-2">
                        <Label htmlFor="skills" className="text-purple-800 dark:text-purple-300">
                          Compétences
                        </Label>
                        <Textarea
                          id="skills"
                          name="skills"
                          value={formData.skills}
                          onChange={handleChange}
                          placeholder="React, Next.js, Laravel, PHP, TypeScript, etc."
                          rows={3}
                          className="border-purple-200 dark:border-purple-900/50 focus:border-purple-500 focus:ring-purple-500"
                        />
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Séparez les compétences par des virgules
                        </p>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="social" className="space-y-6 mt-4">
                    <div className="grid gap-6">
                      {socialNetworks.map((network) => (
                        <div key={network.name} className="grid gap-2">
                          <Label
                            htmlFor={network.name}
                            className="flex items-center gap-2 text-purple-800 dark:text-purple-300"
                          >
                            <span className="flex items-center justify-center w-5 h-5">{network.icon}</span>
                            {network.label}
                          </Label>
                          <Input
                            id={network.name}
                            name={network.name}
                            value={formData[network.name as keyof typeof formData] as string}
                            onChange={handleChange}
                            placeholder={network.placeholder}
                            className="border-purple-200 dark:border-purple-900/50 focus:border-purple-500 focus:ring-purple-500"
                          />
                        </div>
                      ))}
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
              <CardFooter className="flex justify-end border-t border-gray-100 dark:border-gray-700 pt-6">
                <Button
                  onClick={handleSubmit}
                  disabled={isUpdating}
                  className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-md hover:shadow-lg transition-all duration-200"
                >
                  {isUpdating ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Enregistrement...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Enregistrer
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  )
}