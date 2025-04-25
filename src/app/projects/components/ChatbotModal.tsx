"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { X, Send, Bot, User, Loader2 } from "lucide-react"
import { toast } from "sonner"

interface ChatbotModalProps {
  onClose: () => void
}

interface ChatMessage {
  role: "user" | "assistant"
  content: string
}

const ChatbotModal: React.FC<ChatbotModalProps> = ({ onClose }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content: "Bonjour ! Je suis votre assistant de gestion de projet. Comment puis-je vous aider aujourd'hui ?",
    },
  ])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Faire défiler vers le bas lorsque de nouveaux messages sont ajoutés
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSendMessage = async () => {
    if (!input.trim()) return

    const userMessage = { role: "user" as const, content: input }
    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    try {
      // Créer un historique de conversation propre pour l'API
      const conversationHistory = messages.map((msg) => ({
        role: msg.role,
        content: msg.content,
      }))

      const response = await fetch("http://localhost:8000/api/ai/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Clerk-User-Id": localStorage.getItem("currentUserId") || "",
        },
        body: JSON.stringify({
          message: input,
          conversation_history: conversationHistory,
        }),
      })

      if (!response.ok) {
        throw new Error(`Erreur API: ${response.status}`)
      }

      const data = await response.json()

      // Nettoyer la réponse pour éliminer les instructions potentielles
      let cleanedResponse = data.response
      // Supprimer les balises d'instruction qui pourraient être présentes
      cleanedResponse = cleanedResponse.replace(/<s>\[INST\].*?\[\/INST\]<\/s>/g, "").trim()
      // Supprimer les préfixes "Assistant:" qui pourraient être générés
      cleanedResponse = cleanedResponse.replace(/^Assistant:\s*/i, "").trim()

      setMessages((prev) => [...prev, { role: "assistant", content: cleanedResponse }])
    } catch (error) {
      console.error("Erreur lors de l'envoi du message:", error)
      toast.error("Erreur lors de la communication avec l'assistant")
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Désolé, j'ai rencontré une erreur. Veuillez réessayer plus tard." },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl h-[80vh] flex flex-col">
        <div className="flex justify-between items-center p-4 border-b bg-violet-50">
          <h2 className="text-lg font-semibold flex items-center text-violet-800">
            <Bot size={20} className="text-violet-600 mr-2" />
            Assistant de Gestion de Projet
          </h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-violet-100 text-violet-600" title="Fermer">
            <X size={18} />
          </button>
        </div>

        <div className="flex-grow overflow-y-auto p-4 bg-gray-50">
          {messages.map((message, index) => (
            <div key={index} className={`mb-4 flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[80%] p-3 rounded-lg ${
                  message.role === "user"
                    ? "bg-violet-500 text-white rounded-tr-none"
                    : "bg-white border border-gray-200 rounded-tl-none"
                }`}
              >
                <div className="flex items-center mb-1">
                  {message.role === "assistant" ? (
                    <Bot size={16} className="mr-1 text-violet-500" />
                  ) : (
                    <User size={16} className="mr-1 text-white" />
                  )}
                  <span className={`text-xs font-medium ${message.role === "user" ? "text-white" : "text-gray-500"}`}>
                    {message.role === "user" ? "Vous" : "Assistant"}
                  </span>
                </div>
                <p className="whitespace-pre-wrap">{message.content}</p>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start mb-4">
              <div className="max-w-[80%] p-3 rounded-lg bg-white border border-gray-200 rounded-tl-none">
                <div className="flex items-center">
                  <Bot size={16} className="mr-1 text-violet-500" />
                  <span className="text-xs font-medium text-gray-500">Assistant</span>
                </div>
                <div className="flex items-center mt-2">
                  <Loader2 size={16} className="animate-spin text-violet-500 mr-2" />
                  <span className="text-gray-500">En train d'écrire...</span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-4 border-t">
          <div className="flex items-center">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Posez une question sur la gestion de projet..."
              className="flex-grow p-3 border rounded-l-md focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none"
              rows={2}
              disabled={isLoading}
            />
            <button
              onClick={handleSendMessage}
              disabled={!input.trim() || isLoading}
              className="p-3 bg-violet-500 text-white rounded-r-md hover:bg-violet-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send size={18} />
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Appuyez sur Entrée pour envoyer, Maj+Entrée pour un saut de ligne
          </p>
        </div>
      </div>
    </div>
  )
}

export default ChatbotModal
