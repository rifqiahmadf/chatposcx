"use client"

import React, { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Send, Bot, User, Loader2 } from "lucide-react"

export default function ChatGPTStyleLayout() {
  const [message, setMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [userId, setUserId] = useState("")
  const [sessionId, setSessionId] = useState("")
  const [chatHistory, setChatHistory] = useState<{ role: "user" | "bot"; text: string }[]>([])
  const chatContainerRef = useRef<HTMLDivElement>(null)
  const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

  const generateId = (prefix: string) => `${prefix}${Math.floor(Math.random() * 1000000)}`

  const handleRefreshSession = async () => {
    const newUserId = generateId("u")
    const newSessionId = generateId("s")
    try {
      const res = await fetch(`/api/proxy/${newUserId}/${newSessionId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      })
      if (!res.ok) throw new Error("Failed to create session")
      const data = await res.json()
      setUserId(data.userId)
      setSessionId(data.id)
      setChatHistory([])
    } catch (error) {
      console.error("Error creating session:", error)
    }
  }

  useEffect(() => {
    handleRefreshSession()
  }, [])

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
    }
  }, [chatHistory])

  const handleSend = async () => {
    if (!message.trim()) return
    const currentMessage = message // simpan dulu isinya
    setMessage("") // kosongkan langsung input field
    setIsLoading(true)
    setChatHistory((prev) => [...prev, { role: "user", text: currentMessage }])

    try {
      const res = await fetch(`/api/run`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          appName: "multi_tool_agent",
          userId,
          sessionId,
          newMessage: {
            role: "user",
            parts: [{ text: currentMessage }],
          },
        }),
      })

      if (!res.ok) throw new Error("Failed to get response")
      const data = await res.json()
      console.log("response", data)

      const modelResponses = data.filter(
        (event: any) =>
          event.content?.role === "model" &&
          Array.isArray(event.content.parts)
      )

      // Ambil semua teks dari parts
      const allParts: string[] = []
      modelResponses.forEach((event: any) => {
        event.content.parts.forEach((part: any) => {
          if (typeof part.text === "string" && part.text.trim() !== "") {
            allParts.push(part.text.trim())
          }
        })
      })
      setMessage("")
      // Tampilkan satu per satu dengan delay
      // for (let i = 0; i < allParts.length; i++) {
      //   await sleep(400) // delay 400ms antar bubble
      //   setChatHistory((prev) => [...prev, { role: "bot", text: allParts[i] }])
      // }
      setChatHistory((prev) => [...prev, { role: "bot", text: allParts[allParts.length - 1] }])
    } catch (error) {
      console.error("Error:", error)
      setChatHistory((prev) => [
        ...prev,
        { role: "bot", text: "Sorry, there was an error processing your request." },
      ])
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
    <div className="flex flex-col h-screen w-full">
      <header className="bg-white border-b border-gray-200 px-4 py-3 shadow-sm sticky top-0 z-10">
        <div className="max-w mx-auto flex justify-between items-center">
          {/* Kiri: Logo */}
          <div className="flex items-center gap-2">
            <img
              src="/assets/logo_posind.png"
              alt="Dara Logo"
              className="w-8 h-8 object-contain"
            />
          </div>

          {/* Tengah: Judul */}
          <h1 className="text-lg font-semibold text-gray-900">Demo Chat Agent</h1>

          {/* Kanan: Refresh */}
          <Button
            variant="outline"
            onClick={() => { window.location.reload() }}
            className="text-sm border-gray-300 hover:bg-gray-100"
          >
            🔄 Refresh
          </Button>
        </div>
      </header>

      <main ref={chatContainerRef} className="relative flex-1 overflow-y-auto bg-transparent pb-24">
        {/* Static Background Pattern */}
        <div className="fixed inset-0 z-0 bg-[url('/assets/bg-pattern.jpg')] bg-repeat  pointer-events-none" style={{ opacity: 0.4 }} />

        {/* Chat Content */}
        <div className="relative z-10 max-w-3xl mx-auto px-4 py-6 space-y-6">
          {chatHistory.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`prose-sm whitespace-pre-wrap px-4 py-3 rounded-2xl shadow max-w-[80%]
            ${msg.role === "user"
                    ? "bg-[#1B2C5A] text-white rounded-br-none"
                    : "bg-white text-gray-800 rounded-bl-none"}`}
              >
                <div className="flex items-center mb-1 text-xs opacity-60">
                  {msg.role === "user" ? (
                    <User className="w-4 h-4 mr-1" />
                  ) : (
                    <img src="/assets/logo_posind.png" alt="Bot" className="w-4 h-4 mr-1" />
                  )}
                  <span>{msg.role === "user" ? "You" : "Dara"}</span>
                </div>
                {msg.text}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white px-4 py-3 rounded-2xl shadow text-sm text-gray-700 flex items-center">
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Thinking...
              </div>
            </div>
          )}
        </div>
      </main>
      <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 w-full max-w-3xl px-4 z-20">
        <div className="flex items-center gap-2 p-2 bg-white shadow-md rounded-2xl border border-gray-200">
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            className="flex-1 bg-gray-100 text-sm border-none focus:ring-0 focus:outline-none"
          />
          <Button
            onClick={handleSend}
            disabled={isLoading || !message.trim()}
            className="rounded-full bg-[#EE3F22] text-white hover:bg-[#d6341f]"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </Button>
        </div>
      </div>


    </div>
  )
}
