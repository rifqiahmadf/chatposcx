import { type NextRequest, NextResponse } from "next/server"

// Mock agent response - replace with actual ADK integration
async function processAgentRequest(requestData: any) {
  const userMessage = requestData.newMessage.parts[0].text

  // Simulate processing time
  await new Promise((resolve) => setTimeout(resolve, 1000))

  // Mock response structure based on ADK documentation
  const events = [
    {
      content: {
        parts: [
          {
            text: generateMockResponse(userMessage),
          },
        ],
        role: "model",
      },
      invocationId: `e-${Date.now()}`,
      author: "simple_chat_agent",
      actions: {
        stateDelta: {},
        artifactDelta: {},
        requestedAuthConfigs: {},
      },
      id: generateId(),
      timestamp: Date.now() / 1000,
    },
  ]

  return { events }
}

function generateMockResponse(userMessage: string): string {
  const responses = [
    `I understand you're asking about: "${userMessage}". This is a simple chat interface without persistent history.`,
    `Thanks for your message: "${userMessage}". I'm here to help with any questions you have.`,
    `You mentioned: "${userMessage}". I'm a simple AI assistant ready to assist you.`,
    `Regarding "${userMessage}" - I'm designed to provide helpful responses in this clean, history-free interface.`,
  ]

  // Simple response selection based on message content
  if (userMessage.toLowerCase().includes("hello") || userMessage.toLowerCase().includes("hi")) {
    return `Hello! Nice to meet you. You said: "${userMessage}". How can I help you today?`
  }

  if (userMessage.toLowerCase().includes("weather")) {
    return `I'd love to help with weather information, but I'm a simple demo agent. You asked: "${userMessage}". In a real implementation, I would connect to weather APIs.`
  }

  if (userMessage.toLowerCase().includes("time")) {
    return `The current time is ${new Date().toLocaleTimeString()}. You asked: "${userMessage}".`
  }

  if (userMessage.toLowerCase().includes("list") || userMessage.toLowerCase().includes("items")) {
    return `Here's a list of items you requested:

- First item with some description
- Second item that has multiple words
- Third item which is longer

This text demonstrates the newline issue:
First line
Second line
Third line

Paragraph break:

This is a new paragraph.

Some **bold text** and *italic text* for testing.`
  }

  return responses[Math.floor(Math.random() * responses.length)]
}

function generateId(): string {
  return Math.random().toString(36).substr(2, 8)
}

async function handlePost(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate request structure - make it more lenient for testing
    if (!body.newMessage) {
      return NextResponse.json(
        { error: "Missing required field: newMessage" },
        { status: 400 },
      )
    }

    // Process the request
    const result = await processAgentRequest(body)

    return NextResponse.json(result)
  } catch (error) {
    console.error("Chat API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// Export the handler without Elasticsearch logging (only /api/run should be logged)
export const POST = handlePost
