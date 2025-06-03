"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Send, Bot, User, Loader2 } from "lucide-react"

export default function SimpleChatGPT() {
  const [message, setMessage] = useState("")
  const [response, setResponse] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [currentMessage, setCurrentMessage] = useState("")

  const handleSend = async () => {
    if (!message.trim()) return

    setIsLoading(true)
    setCurrentMessage(message)
    setResponse("")

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          appName: "simple_chat_agent",
          userId: "u_123",
          sessionId: `s_${Date.now()}`, // New session each time (no history)
          newMessage: {
            role: "user",
            parts: [
              {
                text: message,
              },
            ],
          },
        }),
      })

      if (!res.ok) {
        throw new Error("Failed to get response")
      }

      const data = await res.json()

      // Extract the final response from the events
      const finalEvent = data.events?.find(
        (event: any) => event.content?.parts?.[0]?.text && event.content.role === "model",
      )

      if (finalEvent) {
        setResponse(finalEvent.content.parts[0].text)
      } else {
        setResponse("Sorry, I could not generate a response.")
      }
    } catch (error) {
      console.error("Error:", error)
      setResponse("Sorry, there was an error processing your request.")
    } finally {
      setIsLoading(false)
      setMessage("")
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Simple Chat</h1>
          <p className="text-gray-600">Ask me anything - no chat history stored</p>
        </div>

        {/* Current Conversation */}
        {(currentMessage || response || isLoading) && (
          <div className="space-y-4">
            {/* User Message */}
            {currentMessage && (
              <Card className="ml-12">
                <CardContent className="p-4">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                        <User className="w-4 h-4 text-white" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <p className="text-gray-900">{currentMessage}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* AI Response */}
            <Card className="mr-12">
              <CardContent className="p-4">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                      <Bot className="w-4 h-4 text-white" />
                    </div>
                  </div>
                  <div className="flex-1">
                    {isLoading ? (
                      <div className="flex items-center space-x-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span className="text-gray-500">Thinking...</span>
                      </div>
                    ) : (
                      <p className="text-gray-900 whitespace-pre-wrap">{response}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Input Area */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Send a message</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex space-x-2">
              <Input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message here..."
                disabled={isLoading}
                className="flex-1"
              />
              <Button onClick={handleSend} disabled={isLoading || !message.trim()} size="icon">
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </Button>
            </div>
            <p className="text-sm text-gray-500 mt-2">Press Enter to send • Each conversation starts fresh</p>
          </CardContent>
        </Card>

        {/* Info Card */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <p className="text-sm text-blue-700">
                This is a simple chat interface with no history. Each message starts a new conversation.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
