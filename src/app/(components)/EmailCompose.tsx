"use client"

import { useState, useRef, type FormEvent, type ChangeEvent } from "react"
import type { Email, User, Priority } from "@/types/mailTypes"
import { Button } from "@/app/(components)/ui/button"
import { Input } from "@/app/(components)/ui/input"
import { Textarea } from "@/app/(components)/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/(components)/ui/select"
import { Label } from "@/app/(components)/ui/label"
import { Paperclip, Sparkles, X, Send, Save } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/app/(components)/ui/dialog"
import { toast } from "sonner"
interface EmailComposeProps {
  users: User[]
  newEmail: Partial<Email>
  setNewEmail: (email: Partial<Email>) => void
  attachments: File[]
  setAttachments: (files: File[]) => void
  onSend: (e: FormEvent) => void
  onSaveDraft: () => void
  onCancel: () => void
}

export default function EmailCompose({
  users,
  newEmail,
  setNewEmail,
  attachments,
  setAttachments,
  onSend,
  onSaveDraft,
  onCancel,
}: EmailComposeProps) {
  const [showAIPrompt, setShowAIPrompt] = useState(false)
  const [aiPrompt, setAiPrompt] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files) {
      // Check if files are too large (20MB limit)
      const oversizedFiles = Array.from(files).filter((file) => file.size > 20 * 1024 * 1024)
      if (oversizedFiles.length > 0) {
        toast.error("Certains fichiers dépassent la limite de 20MB")
        return
      }

      setAttachments([...attachments, ...Array.from(files)])
      e.target.value = ""
    }
  }

  const getPriorityColor = (priority: Priority) => {
    if (priority === "high") return "bg-red-500"
    if (priority === "normal") return "bg-amber-400"
    return "bg-green-500"
  }

  // Simulation de génération de contenu par IA
  const handleAIGeneration = async () => {
    if (!aiPrompt.trim()) return

    setIsGenerating(true)
    try {
      const aiResponse = await new Promise<string>((resolve) =>
        setTimeout(
          () =>
            resolve(
              `Bonjour,\n\nSuite à votre demande "${aiPrompt}", voici un message professionnel généré automatiquement.\n\nCordialement,\n[Votre nom]`,
            ),
          1000,
        ),
      )

      setNewEmail({
        ...newEmail,
        content: aiResponse,
        aiGenerated: true,
      })
      setShowAIPrompt(false)
      setAiPrompt("")
      textareaRef.current?.focus()

      toast.success("Contenu généré avec succès")
    } catch (error) {
      toast.error("Erreur lors de la génération du contenu")
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="flex-1 p-4 md:p-6 flex flex-col h-full animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold">Nouveau message</h2>
        <Button variant="ghost" size="icon" onClick={onCancel}>
          <X className="h-5 w-5" />
        </Button>
      </div>

      <form onSubmit={onSend} className="space-y-4 flex-1 flex flex-col">
        <div className="space-y-4 flex-1">
          <div className="space-y-2">
            <Label htmlFor="recipient">Destinataire</Label>
            <Select
              value={newEmail.recipient || ""}
              onValueChange={(value) => setNewEmail({ ...newEmail, recipient: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un destinataire" />
              </SelectTrigger>
              <SelectContent>
                {users.map((user) => (
                  <SelectItem key={user.id} value={user.email}>
                    <div className="flex items-center">
                      <img src={user.avatar} alt={user.name} className="w-5 h-5 rounded-full mr-2" />
                      {user.name} ({user.email})
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="subject">Objet</Label>
            <Input
              id="subject"
              placeholder="Objet du message"
              value={newEmail.subject || ""}
              onChange={(e) => setNewEmail({ ...newEmail, subject: e.target.value })}
            />
          </div>

          <div className="flex items-center gap-4 mb-2">
            <div className="flex items-center gap-2">
              <Label htmlFor="priority">Priorité</Label>
              <Select
                value={newEmail.priority || "normal"}
                onValueChange={(value) => setNewEmail({ ...newEmail, priority: value as Priority })}
              >
                <SelectTrigger className="w-[150px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="high">Important</SelectItem>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="low">Peu important</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className={`w-3 h-3 rounded-full ${getPriorityColor((newEmail.priority as Priority) || "normal")}`} />
          </div>

          <div className="flex-1 relative">
            <Textarea
              ref={textareaRef}
              className="min-h-[200px] resize-none h-full pb-10"
              placeholder="Commencez à écrire..."
              value={newEmail.content || ""}
              onChange={(e) => setNewEmail({ ...newEmail, content: e.target.value })}
            />

            <div className="absolute bottom-3 right-3 flex gap-2">
              <Button
                type="button"
                size="icon"
                variant="ghost"
                onClick={() => setShowAIPrompt(true)}
                title="Générer avec l'IA"
              >
                <Sparkles className="h-4 w-4 text-primary" />
              </Button>

              <input type="file" multiple ref={fileInputRef} onChange={handleFileUpload} className="hidden" />

              <Button
                type="button"
                size="icon"
                variant="ghost"
                onClick={() => fileInputRef.current?.click()}
                title="Ajouter des pièces jointes"
              >
                <Paperclip className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {attachments.length > 0 && (
            <div className="space-y-2">
              <Label>Pièces jointes ({attachments.length})</Label>
              <div className="flex flex-wrap gap-2 bg-muted/30 p-2 rounded-lg">
                {attachments.map((file, index) => (
                  <div key={index} className="flex items-center gap-2 bg-card px-3 py-1.5 rounded-lg text-sm border">
                    <Paperclip className="h-3.5 w-3.5" />
                    <span className="max-w-[200px] truncate">{file.name}</span>
                    <button
                      type="button"
                      onClick={() => {
                        const newAttachments = [...attachments]
                        newAttachments.splice(index, 1)
                        setAttachments(newAttachments)
                      }}
                      className="text-muted-foreground hover:text-destructive transition-colors"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onSaveDraft}>
            <Save className="h-4 w-4 mr-2" />
            Brouillon
          </Button>

          <Button type="button" variant="secondary" onClick={onCancel}>
            Annuler
          </Button>

          <Button type="submit" variant="default" className="gap-2">
            <Send className="h-4 w-4" />
            Envoyer
          </Button>
        </div>
      </form>

      <Dialog open={showAIPrompt} onOpenChange={setShowAIPrompt}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Génération de message par IA</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <p className="text-sm text-muted-foreground">
              Décrivez le contenu que vous souhaitez générer pour votre message.
            </p>

            <Textarea
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              placeholder="Ex: Une réponse professionnelle confirmant ma disponibilité pour une réunion"
              className="min-h-[100px]"
            />
          </div>

          <DialogFooter className="flex justify-between sm:justify-between">
            <Button variant="secondary" onClick={() => setShowAIPrompt(false)}>
              Annuler
            </Button>

            <Button variant="default" onClick={handleAIGeneration} disabled={isGenerating || !aiPrompt.trim()}>
              {isGenerating ? "Génération..." : "Générer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
