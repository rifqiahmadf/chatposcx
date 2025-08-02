import { NextRequest, NextResponse } from 'next/server'
import { logApiResponse } from '@/lib/elasticsearch-middleware'

export async function POST(request: NextRequest) {
    const startTime = Date.now()
    let requestData: any = {}
    let responseData: any = {}
    let statusCode = 200

    try {
        // Parse the request body
        requestData = await request.json()

        // For demo purposes, use the local chat API instead of external service
        const chatResponse = await fetch('http://localhost:3006/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                appName: requestData.appName || 'demo_agent',
                userId: requestData.user_id || 'demo_user',
                sessionId: requestData.session_id || 'demo_session',
                newMessage: requestData.newMessage
            })
        })

        statusCode = chatResponse.status

        // Parse the response
        const chatData = await chatResponse.json()
        
        // Transform the response to match expected format
        responseData = chatData.events || [chatData]

        // Log to Elasticsearch
        await logApiResponse(request, requestData, responseData, statusCode, startTime)

        // Return the response to the client
        return NextResponse.json(responseData, { status: statusCode })

    } catch (error) {
        console.error('Error in /api/run proxy:', error)
        statusCode = 500
        responseData = {
            error: 'Proxy error',
            details: error instanceof Error ? error.message : 'Unknown error'
        }

        // Log the error to Elasticsearch
        await logApiResponse(request, requestData, responseData, statusCode, startTime)

        return NextResponse.json(responseData, { status: statusCode })
    }
}
