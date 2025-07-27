import { NextRequest, NextResponse } from 'next/server'
import { saveApiResponse, type ApiResponseData } from './elasticsearch'

// Elasticsearch logging middleware for API routes
export function withElasticsearchLogging<T extends (...args: any[]) => Promise<NextResponse>>(
    handler: T,
    endpointName: string
): T {
    return (async (request: NextRequest, ...args: any[]) => {
        const startTime = Date.now()
        let requestBody: any = {}
        let responseData: any = {}
        let statusCode = 200

        try {
            // Try to get request body if it exists
            if (request.method === 'POST' || request.method === 'PUT' || request.method === 'PATCH') {
                try {
                    requestBody = await request.clone().json()
                } catch (error) {
                    // Body might not be JSON or might be empty
                    requestBody = {}
                }
            }

            // Call the original handler
            const response = await handler(request, ...args)

            // Extract response data
            statusCode = response.status

            try {
                const responseClone = response.clone()
                const responseText = await responseClone.text()

                if (responseText) {
                    try {
                        responseData = JSON.parse(responseText)
                    } catch {
                        responseData = { body: responseText }
                    }
                }
            } catch (error) {
                responseData = { error: 'Could not parse response' }
            }

            // Save to Elasticsearch
            await saveToElasticsearch(request, requestBody, responseData, statusCode, startTime, endpointName)

            return response
        } catch (error) {
            statusCode = 500
            responseData = { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' }

            // Save error to Elasticsearch
            await saveToElasticsearch(request, requestBody, responseData, statusCode, startTime, endpointName)

            throw error
        }
    }) as T
}

// Helper function to save to Elasticsearch
async function saveToElasticsearch(
    request: NextRequest,
    requestData: any,
    responseData: any,
    statusCode: number,
    startTime: number,
    endpoint: string
) {
    try {
        const url = new URL(request.url)

        // Only log if the endpoint is /api/run
        if (url.pathname !== '/api/run') {
            return // Skip logging for all other endpoints
        }

        const responseTime = Date.now() - startTime

        const elasticsearchData: ApiResponseData = {
            timestamp: new Date().toISOString(),
            endpoint: endpoint || url.pathname,
            method: request.method,
            requestData,
            responseData,
            userId: requestData?.userId,
            sessionId: requestData?.sessionId,
            appName: requestData?.appName,
            responseTime,
            statusCode
        }

        await saveApiResponse(elasticsearchData)
    } catch (error) {
        console.error('Failed to save API response to Elasticsearch:', error)
        // Don't throw error to prevent API from failing
    }
}

// Simple logging function for quick integration
export async function logApiResponse(
    request: NextRequest,
    requestData: any,
    responseData: any,
    statusCode: number = 200,
    startTime?: number
) {
    const actualStartTime = startTime || Date.now()
    const url = new URL(request.url)

    // Only log if the endpoint is /api/run
    if (url.pathname !== '/api/run') {
        return // Skip logging for all other endpoints
    }

    await saveToElasticsearch(
        request,
        requestData,
        responseData,
        statusCode,
        actualStartTime,
        url.pathname
    )
}
