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

  // If asking for markdown formatting, return a markdown response to test the fix
  if (userMessage.toLowerCase().includes("markdown") || userMessage.toLowerCase().includes("paragraph")) {
    return `# Markdown Response Test

This is the **first paragraph** with some bold text. It should have minimal spacing after it.

This is the second paragraph with *italic text*. The spacing between paragraphs should be reduced now.

Here's a third paragraph with some \`inline code\` to test the fix.

## A Subtitle

- This is a bulleted list
- With multiple items
- To test spacing

And here's a final paragraph after the list to verify the markdown rendering fix is working properly.`
  }

  return responses[Math.floor(Math.random() * responses.length)]
}

function generateId(): string {
  return Math.random().toString(36).substr(2, 8)
}

async function handlePost(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate request structure based on ADK documentation
    if (!body.appName || !body.userId || !body.sessionId || !body.newMessage) {
      return NextResponse.json(
        { error: "Missing required fields: appName, userId, sessionId, newMessage" },
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
