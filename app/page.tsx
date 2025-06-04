"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Send, Bot, Loader2, MessageCircle } from "lucide-react"

export default function SimpleChatGPT() {
  const [message, setMessage] = useState("")
  const [messages, setMessages] = useState<
    Array<{ id: string; text: string; sender: "user" | "bot"; timestamp: Date }>
  >([])
  const [isLoading, setIsLoading] = useState(false)

  const handleSend = async () => {
    if (!message.trim()) return

    const userMessage = {
      id: Date.now().toString(),
      text: message,
      sender: "user" as const,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setIsLoading(true)
    const currentMessage = message
    setMessage("")

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          appName: "simple_chat_agent",
          userId: "u_123",
          sessionId: `s_${Date.now()}`,
          newMessage: {
            role: "user",
            parts: [{ text: currentMessage }],
          },
        }),
      })

      if (!res.ok) {
        throw new Error("Failed to get response")
      }

      const data = await res.json()
      const finalEvent = data.events?.find(
        (event: any) => event.content?.parts?.[0]?.text && event.content.role === "model",
      )

      const botMessage = {
        id: (Date.now() + 1).toString(),
        text: finalEvent ? finalEvent.content.parts[0].text : "Sorry, I could not generate a response.",
        sender: "bot" as const,
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, botMessage])
    } catch (error) {
      console.error("Error:", error)
      const errorMessage = {
        id: (Date.now() + 1).toString(),
        text: "Sorry, there was an error processing your request.",
        sender: "bot" as const,
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="h-screen bg-gray-100 flex justify-center">
      {/* Main Chat Container with max width */}
      <div className="w-full max-w-4xl h-full flex flex-col border-x border-gray-200">
        {/* Chat Header */}
        <div className="bg-[#1e3a8a] text-white p-4 flex items-center space-x-3 shadow-sm">
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-medium">AI Assistant</h2>
            <p className="text-sm text-white/80">Online</p>
          </div>
        </div>

        {/* Messages Area */}
        <div
          className="flex-1 overflow-y-auto p-4 space-y-4"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fillRule='evenodd'%3E%3Cg fill='%23e5e7eb' fillOpacity='0.3'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3Ccircle cx='10' cy='10' r='1'/%3E%3Ccircle cx='50' cy='10' r='1'/%3E%3Ccircle cx='10' cy='50' r='1'/%3E%3Ccircle cx='50' cy='50' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            backgroundColor: "#f0f2f5",
          }}
        >
          {messages.length === 0 && (
            <div className="flex items-center justify-center h-full">
              <div className="text-center text-gray-500">
                <MessageCircle className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium mb-2">Welcome to Simple Chat</h3>
                <p>Send a message to start the conversation</p>
              </div>
            </div>
          )}

          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-xs lg:max-w-lg px-4 py-2 rounded-lg ${
                  msg.sender === "user"
                    ? "bg-[#1e3a8a] text-white rounded-br-none"
                    : "bg-white text-gray-900 rounded-bl-none shadow-sm"
                }`}
              >
                <p className="whitespace-pre-wrap">{msg.text}</p>
                <p className={`text-xs mt-1 ${msg.sender === "user" ? "text-white/70" : "text-gray-500"}`}>
                  {msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white text-gray-900 rounded-lg rounded-bl-none shadow-sm px-4 py-2">
                <div className="flex items-center space-x-2">
                  <Loader2 className="w-4 h-4 animate-spin text-[#1e3a8a]" />
                  <span className="text-gray-500">AI is typing...</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="bg-white border-t border-gray-200 p-4">
          <div className="flex items-center space-x-3 max-w-3xl mx-auto">
            <div className="flex-1 bg-gray-100 rounded-full px-4 py-2 flex items-center space-x-2">
              <Input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type a message"
                disabled={isLoading}
                className="flex-1 bg-transparent border-none focus:ring-0 focus:outline-none p-0"
              />
            </div>
            <Button
              onClick={handleSend}
              disabled={isLoading || !message.trim()}
              size="icon"
              className="bg-[#1e3a8a] hover:bg-[#1e3a8a]/90 rounded-full"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
