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
        <div className="bg-white border border-gray-200 p-4 flex items-center space-x-3 shadow-sm">
          <div className="w-10 h-10 border-2 border-[#1e3a8a] rounded-full flex items-center justify-center">
            <Bot className="w-5 h-5 text-[#1e3a8a]" />
          </div>
          <div>
            <h2 className="font-medium text-gray-900">AI Assistant</h2>
            <p className="text-sm text-gray-500">Online</p>
          </div>
        </div>

        {/* Messages Area */}
        <div
          className="flex-1 overflow-y-auto p-4 space-y-4 rounded-tl-3xl rounded-tr-3xl"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='%23e5e7eb' strokeWidth='1' strokeOpacity='0.4'%3E%3Cpath d='M20,20 Q30,10 40,20 T60,20 T80,20' fill='none'/%3E%3Cpath d='M10,40 Q20,30 30,40 T50,40 T70,40 T90,40' fill='none'/%3E%3Cpath d='M15,60 Q25,50 35,60 T55,60 T75,60' fill='none'/%3E%3Cpath d='M5,80 Q15,70 25,80 T45,80 T65,80 T85,80' fill='none'/%3E%3Ccircle cx='25' cy='25' r='2' fill='%23e5e7eb' fillOpacity='0.3'/%3E%3Ccircle cx='75' cy='35' r='1.5' fill='%23e5e7eb' fillOpacity='0.3'/%3E%3Ccircle cx='45' cy='65' r='1' fill='%23e5e7eb' fillOpacity='0.3'/%3E%3Ccircle cx='85' cy='75' r='2' fill='%23e5e7eb' fillOpacity='0.3'/%3E%3Cpath d='M30,15 L35,10 L40,15 L35,20 Z' fill='%23e5e7eb' fillOpacity='0.2'/%3E%3Cpath d='M70,55 L75,50 L80,55 L75,60 Z' fill='%23e5e7eb' fillOpacity='0.2'/%3E%3C/g%3E%3C/svg%3E")`,
            backgroundColor: "#f8fafc",
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
                className={`max-w-xs lg:max-w-lg px-4 py-2 rounded-2xl ${
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
