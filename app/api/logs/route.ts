import { NextRequest, NextResponse } from 'next/server'
import { searchApiResponses } from '@/lib/elasticsearch'

export async function GET(request: NextRequest) {
    try {
        const url = new URL(request.url)
        const limit = parseInt(url.searchParams.get('limit') || '50')
        const userId = url.searchParams.get('userId')
        const sessionId = url.searchParams.get('sessionId')
        const endpoint = url.searchParams.get('endpoint')
        const from = url.searchParams.get('from') // Date from
        const to = url.searchParams.get('to') // Date to

        let query: any = { match_all: {} }

        // Build query based on parameters
        const filters: any[] = []

        if (userId) {
            filters.push({ term: { userId } })
        }

        if (sessionId) {
            filters.push({ term: { sessionId } })
        }

        if (endpoint) {
            filters.push({ term: { endpoint } })
        }

        if (from || to) {
            const rangeQuery: any = {}
            if (from) rangeQuery.gte = from
            if (to) rangeQuery.lte = to

            filters.push({
                range: {
                    timestamp: rangeQuery
                }
            })
        }

        if (filters.length > 0) {
            query = {
                bool: {
                    must: filters
                }
            }
        }

        const results = await searchApiResponses({
            query: { query },
            size: limit,
            sort: [{ timestamp: { order: 'desc' } }]
        })

        // Format the results for better readability
        const formattedResults = results.map(result => ({
            id: result.id,
            timestamp: result.timestamp,
            endpoint: result.endpoint,
            method: result.method,
            statusCode: result.statusCode,
            responseTime: result.responseTime,
            userId: result.userId,
            sessionId: result.sessionId,
            appName: result.appName,
            // Truncate large request/response data for overview
            requestSummary: truncateObject(result.requestData, 200),
            responseSummary: truncateObject(result.responseData, 200),
            hasFullData: true
        }))

        return NextResponse.json({
            total: results.length,
            data: formattedResults,
            query: query
        })
    } catch (error) {
        console.error('Error fetching API logs:', error)
        return NextResponse.json(
            { error: 'Failed to fetch logs', details: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        )
    }
}

// Helper function to truncate large objects for summary view
function truncateObject(obj: any, maxLength: number = 200): any {
    if (!obj) return obj

    const str = JSON.stringify(obj)
    if (str.length <= maxLength) return obj

    return {
        _truncated: true,
        _originalLength: str.length,
        preview: str.substring(0, maxLength) + '...'
    }
}
