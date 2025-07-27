import { NextRequest, NextResponse } from 'next/server'
import { testElasticsearchConnection, searchApiResponses } from '@/lib/elasticsearch'

// GET endpoint to test connection and retrieve logs
async function handleGet(request: NextRequest) {
    try {
        const url = new URL(request.url)
        const action = url.searchParams.get('action')

        switch (action) {
            case 'test':
                const isConnected = await testElasticsearchConnection()
                return NextResponse.json({
                    connected: isConnected,
                    message: isConnected ? 'Elasticsearch connection successful' : 'Elasticsearch connection failed'
                })

            case 'search':
            case null:
            default:
                const limit = parseInt(url.searchParams.get('limit') || '10')
                const userId = url.searchParams.get('userId')
                const sessionId = url.searchParams.get('sessionId')

                let query: any = { match_all: {} }

                // Build query based on parameters
                if (userId || sessionId) {
                    query = {
                        bool: {
                            must: []
                        }
                    }

                    if (userId) {
                        query.bool.must.push({ term: { userId } })
                    }

                    if (sessionId) {
                        query.bool.must.push({ term: { sessionId } })
                    }
                }

                const results = await searchApiResponses({
                    query: { query },
                    size: limit,
                    sort: [{ timestamp: { order: 'desc' } }]
                })

                return NextResponse.json({
                    total: results.length,
                    data: results
                })
        }
    } catch (error) {
        console.error('Elasticsearch API error:', error)
        return NextResponse.json(
            { error: 'Failed to process request', details: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        )
    }
}

// Export the handler without Elasticsearch logging (only /api/run should be logged)
export const GET = handleGet
