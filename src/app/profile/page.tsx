"use client"
import { useState, useEffect } from "react"
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
import { Loader2, Save, User, Briefcase, Award, MapPin, Mail, Phone, Calendar } from "lucide-react"
import { useUpdateUserProfileMutation } from "@/app/state/api"

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
    skills: "",
    website: "",
    linkedin: "",
    github: "",
    twitter: "",
  })

  useEffect(() => {
    if (userData?.user) {
      setFormData({
        name: userData.user.name || "",
        email: userData.user.email || "",
        bio: userData.user.bio || "",
        jobTitle: userData.user.job_title || "",
        company: userData.user.company || "",
        location: userData.user.location || "",
        phone: userData.user.phone || "",
        skills: userData.user.skills || "",
        website: userData.user.website || "",
        linkedin: userData.user.linkedin || "",
        github: userData.user.github || "",
        twitter: userData.user.twitter || "",
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-bold">Erreur lors du chargement du profil</h2>
          <p className="text-muted-foreground">Veuillez réessayer ultérieurement</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container max-w-5xl py-10">
      <div className="flex flex-col gap-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Profil Professionnel</h1>
          <Button onClick={handleSubmit} disabled={isUpdating}>
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

        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {/* Colonne de gauche - Informations de base */}
          <Card className="md:col-span-1">
            <CardHeader>
              <CardTitle>Informations personnelles</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-6">
              <Avatar className="w-32 h-32">
                <AvatarImage src={user?.imageUrl || "/placeholder.svg"} alt={formData.name} />
                <AvatarFallback>{formData.name?.charAt(0) || "U"}</AvatarFallback>
              </Avatar>

              <div className="w-full space-y-4">
                <div className="flex items-center gap-2">
                  <User className="w-5 h-5 text-muted-foreground" />
                  <span className="text-sm font-medium">{formData.name}</span>
                </div>

                <div className="flex items-center gap-2">
                  <Mail className="w-5 h-5 text-muted-foreground" />
                  <span className="text-sm">{formData.email}</span>
                </div>

                {formData.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-5 h-5 text-muted-foreground" />
                    <span className="text-sm">{formData.phone}</span>
                  </div>
                )}

                {formData.location && (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-muted-foreground" />
                    <span className="text-sm">{formData.location}</span>
                  </div>
                )}

                {formData.jobTitle && (
                  <div className="flex items-center gap-2">
                    <Briefcase className="w-5 h-5 text-muted-foreground" />
                    <span className="text-sm">{formData.jobTitle}</span>
                  </div>
                )}

                {formData.company && (
                  <div className="flex items-center gap-2">
                    <Award className="w-5 h-5 text-muted-foreground" />
                    <span className="text-sm">{formData.company}</span>
                  </div>
                )}
              </div>

              {userData?.user?.created_at && (
                <div className="flex items-center gap-2 mt-4 text-sm text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  <span>Membre depuis {new Date(userData.user.created_at).toLocaleDateString()}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Colonne de droite - Formulaire d'édition */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Modifier votre profil</CardTitle>
              <CardDescription>
                Mettez à jour vos informations professionnelles pour compléter votre profil
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="personal">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="personal">Personnel</TabsTrigger>
                  <TabsTrigger value="professional">Professionnel</TabsTrigger>
                  <TabsTrigger value="social">Réseaux sociaux</TabsTrigger>
                </TabsList>

                <TabsContent value="personal" className="space-y-4 mt-4">
                  <div className="grid gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="name">Nom complet</Label>
                      <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Votre nom complet"
                      />
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="votre.email@exemple.com"
                      />
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="phone">Téléphone</Label>
                      <Input
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="+33 6 12 34 56 78"
                      />
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="location">Localisation</Label>
                      <Input
                        id="location"
                        name="location"
                        value={formData.location}
                        onChange={handleChange}
                        placeholder="Paris, France"
                      />
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="bio">Biographie</Label>
                      <Textarea
                        id="bio"
                        name="bio"
                        value={formData.bio}
                        onChange={handleChange}
                        placeholder="Parlez-nous de vous en quelques mots..."
                        rows={4}
                      />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="professional" className="space-y-4 mt-4">
                  <div className="grid gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="jobTitle">Titre du poste</Label>
                      <Input
                        id="jobTitle"
                        name="jobTitle"
                        value={formData.jobTitle}
                        onChange={handleChange}
                        placeholder="Développeur Full Stack"
                      />
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="company">Entreprise</Label>
                      <Input
                        id="company"
                        name="company"
                        value={formData.company}
                        onChange={handleChange}
                        placeholder="Nom de votre entreprise"
                      />
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="skills">Compétences</Label>
                      <Textarea
                        id="skills"
                        name="skills"
                        value={formData.skills}
                        onChange={handleChange}
                        placeholder="React, Next.js, Laravel, PHP, TypeScript, etc."
                        rows={3}
                      />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="social" className="space-y-4 mt-4">
                  <div className="grid gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="website">Site web</Label>
                      <Input
                        id="website"
                        name="website"
                        value={formData.website}
                        onChange={handleChange}
                        placeholder="https://votresite.com"
                      />
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="linkedin">LinkedIn</Label>
                      <Input
                        id="linkedin"
                        name="linkedin"
                        value={formData.linkedin}
                        onChange={handleChange}
                        placeholder="https://linkedin.com/in/votrenom"
                      />
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="github">GitHub</Label>
                      <Input
                        id="github"
                        name="github"
                        value={formData.github}
                        onChange={handleChange}
                        placeholder="https://github.com/votrenom"
                      />
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="twitter">Twitter</Label>
                      <Input
                        id="twitter"
                        name="twitter"
                        value={formData.twitter}
                        onChange={handleChange}
                        placeholder="https://twitter.com/votrenom"
                      />
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button onClick={handleSubmit} disabled={isUpdating}>
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
        </div>
      </div>
    </div>
  )
}
