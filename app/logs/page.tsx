"use client";

import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ApiLog {
  id: string;
  timestamp: string;
  endpoint: string;
  method: string;
  statusCode: number;
  responseTime: number;
  userId?: string;
  sessionId?: string;
  appName?: string;
  requestSummary: any;
  responseSummary: any;
  hasFullData: boolean;
}

export default function LogsDashboard() {
  const [logs, setLogs] = useState<ApiLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    limit: "50",
    userId: "",
    sessionId: "",
    endpoint: "",
    from: "",
    to: "",
  });
  const [connectionStatus, setConnectionStatus] = useState<
    "unknown" | "connected" | "disconnected"
  >("unknown");

  const testConnection = async () => {
    try {
      const response = await fetch("/api/elasticsearch?action=test");
      const data = await response.json();
      setConnectionStatus(data.connected ? "connected" : "disconnected");
    } catch (error) {
      setConnectionStatus("disconnected");
    }
  };

  const fetchLogs = async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });

      const response = await fetch(`/api/logs?${params}`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      setLogs(data.data || []);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to fetch logs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    testConnection();
    fetchLogs();
  }, []);

  const getStatusColor = (statusCode: number) => {
    if (statusCode >= 200 && statusCode < 300) return "bg-green-500";
    if (statusCode >= 400 && statusCode < 500) return "bg-yellow-500";
    if (statusCode >= 500) return "bg-red-500";
    return "bg-gray-500";
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">API Logs Dashboard</h1>
          <p className="text-muted-foreground">
            Monitor and analyze API requests and responses
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge
            variant={
              connectionStatus === "connected" ? "default" : "destructive"
            }
          >
            Elasticsearch: {connectionStatus}
          </Badge>
          <Button onClick={testConnection} variant="outline" size="sm">
            Test Connection
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>Filter logs by various criteria</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div>
              <Label htmlFor="limit">Limit</Label>
              <Select
                value={filters.limit}
                onValueChange={(value) =>
                  setFilters((prev) => ({ ...prev, limit: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="userId">User ID</Label>
              <Input
                id="userId"
                placeholder="Filter by user ID"
                value={filters.userId}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, userId: e.target.value }))
                }
              />
            </div>

            <div>
              <Label htmlFor="sessionId">Session ID</Label>
              <Input
                id="sessionId"
                placeholder="Filter by session ID"
                value={filters.sessionId}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, sessionId: e.target.value }))
                }
              />
            </div>

            <div>
              <Label htmlFor="endpoint">Endpoint</Label>
              <Input
                id="endpoint"
                placeholder="Filter by endpoint"
                value={filters.endpoint}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, endpoint: e.target.value }))
                }
              />
            </div>

            <div>
              <Label htmlFor="from">From Date</Label>
              <Input
                id="from"
                type="datetime-local"
                value={filters.from}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, from: e.target.value }))
                }
              />
            </div>

            <div>
              <Label htmlFor="to">To Date</Label>
              <Input
                id="to"
                type="datetime-local"
                value={filters.to}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, to: e.target.value }))
                }
              />
            </div>
          </div>

          <div className="flex space-x-2">
            <Button onClick={fetchLogs} disabled={loading}>
              {loading ? "Loading..." : "Apply Filters"}
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setFilters({
                  limit: "50",
                  userId: "",
                  sessionId: "",
                  endpoint: "",
                  from: "",
                  to: "",
                });
              }}
            >
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <p className="text-red-600">Error: {error}</p>
          </CardContent>
        </Card>
      )}

      {/* Logs Table */}
      <Card>
        <CardHeader>
          <CardTitle>API Logs ({logs.length} records)</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading logs...</div>
          ) : logs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No logs found
            </div>
          ) : (
            <div className="space-y-4">
              {logs.map((log) => (
                <Card
                  key={log.id}
                  className="border-l-4"
                  style={{
                    borderLeftColor: getStatusColor(log.statusCode).replace(
                      "bg-",
                      ""
                    ),
                  }}
                >
                  <CardContent className="pt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                      <div>
                        <Label className="font-medium">Timestamp</Label>
                        <p className="text-muted-foreground">
                          {formatTimestamp(log.timestamp)}
                        </p>
                      </div>

                      <div>
                        <Label className="font-medium">Endpoint</Label>
                        <p className="text-muted-foreground">
                          <Badge variant="outline" className="mr-2">
                            {log.method}
                          </Badge>
                          {log.endpoint}
                        </p>
                      </div>

                      <div>
                        <Label className="font-medium">
                          Status & Response Time
                        </Label>
                        <p className="text-muted-foreground">
                          <Badge className={getStatusColor(log.statusCode)}>
                            {log.statusCode}
                          </Badge>
                          <span className="ml-2">{log.responseTime}ms</span>
                        </p>
                      </div>

                      <div>
                        <Label className="font-medium">User/Session</Label>
                        <p className="text-muted-foreground">
                          {log.userId && <span>User: {log.userId}</span>}
                          {log.userId && log.sessionId && <br />}
                          {log.sessionId && (
                            <span>Session: {log.sessionId}</span>
                          )}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
                      <div>
                        <Label className="font-medium">Request Summary</Label>
                        <pre className="text-xs bg-gray-100 p-2 rounded mt-1 overflow-auto max-h-32">
                          {JSON.stringify(log.requestSummary, null, 2)}
                        </pre>
                      </div>

                      <div>
                        <Label className="font-medium">Response Summary</Label>
                        <pre className="text-xs bg-gray-100 p-2 rounded mt-1 overflow-auto max-h-32">
                          {JSON.stringify(log.responseSummary, null, 2)}
                        </pre>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
