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

        // Forward the request to the actual service
        const response = await fetch('http://10.24.1.43:5001/run', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                // Forward other relevant headers if needed
                ...(request.headers.get('authorization') && {
                    'authorization': request.headers.get('authorization')!
                })
            },
            body: JSON.stringify(requestData)
        })

        statusCode = response.status

        // Parse the response
        const responseText = await response.text()

        try {
            responseData = JSON.parse(responseText)
        } catch {
            responseData = { body: responseText }
        }

        // Log to Elasticsearch
        await logApiResponse(request, requestData, responseData, statusCode, startTime)

        // Return the response to the client
        return new NextResponse(responseText, {
            status: statusCode,
            headers: {
                'Content-Type': response.headers.get('Content-Type') || 'application/json'
            }
        })

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
