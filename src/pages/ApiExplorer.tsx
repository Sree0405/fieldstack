import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { apiClient } from '@/integrations/api/client';

interface Endpoint {
  method: string;
  path: string;
  description: string;
  requiresAuth?: boolean;
  collection?: string;
}

export default function ApiExplorer() {
  const [endpoints, setEndpoints] = useState<Endpoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEndpoint, setSelectedEndpoint] = useState<Endpoint | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [metrics, setMetrics] = useState<any>(null);

  useEffect(() => {
    const fetchEndpoints = async () => {
      try {
        const response = await apiClient.getSystemEndpoints();
        if (response.data?.endpoints) {
          setEndpoints(response.data.endpoints);
        }
        
        // Fetch metrics
        const metricsResponse = await apiClient.getSystemMetrics();
        setMetrics(metricsResponse.data);
      } catch (error) {
        console.error('Failed to fetch endpoints:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEndpoints();
  }, []);

  const filteredEndpoints = endpoints.filter(
    (endpoint) =>
      endpoint.path.toLowerCase().includes(searchTerm.toLowerCase()) ||
      endpoint.description.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const getMethodColor = (method: string) => {
    switch (method.toUpperCase()) {
      case 'GET':
        return 'bg-blue-100 text-blue-800';
      case 'POST':
        return 'bg-green-100 text-green-800';
      case 'PATCH':
        return 'bg-yellow-100 text-yellow-800';
      case 'DELETE':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="w-full space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">🔌 API Explorer</h1>
        <p className="text-muted-foreground">
          Browse and test all available API endpoints in real-time
        </p>
      </div>

      {/* Metrics Summary */}
      {metrics && (
        <div className="grid grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold">{metrics.users}</div>
                <div className="text-sm text-muted-foreground">Users</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold">{metrics.collections}</div>
                <div className="text-sm text-muted-foreground">Collections</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold">{metrics.fields}</div>
                <div className="text-sm text-muted-foreground">Fields</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold">{filteredEndpoints.length}</div>
                <div className="text-sm text-muted-foreground">Endpoints</div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Search and Tabs */}
      <div className="space-y-4">
        <div>
          <Input
            placeholder="Search endpoints..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
        </div>

        <Tabs defaultValue="all" className="w-full">
          <TabsList>
            <TabsTrigger value="all">All Endpoints ({filteredEndpoints.length})</TabsTrigger>
            <TabsTrigger value="get">GET</TabsTrigger>
            <TabsTrigger value="post">POST</TabsTrigger>
            <TabsTrigger value="patch">PATCH</TabsTrigger>
            <TabsTrigger value="delete">DELETE</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-3">
            {loading ? (
              <div className="text-center py-8">Loading endpoints...</div>
            ) : (
              filteredEndpoints.map((endpoint, idx) => (
                <EndpointCard
                  key={idx}
                  endpoint={endpoint}
                  getMethodColor={getMethodColor}
                  onClick={() => setSelectedEndpoint(endpoint)}
                  isSelected={selectedEndpoint === endpoint}
                />
              ))
            )}
          </TabsContent>

          <TabsContent value="get" className="space-y-3">
            {filteredEndpoints
              .filter((e) => e.method === 'GET')
              .map((endpoint, idx) => (
                <EndpointCard
                  key={idx}
                  endpoint={endpoint}
                  getMethodColor={getMethodColor}
                  onClick={() => setSelectedEndpoint(endpoint)}
                  isSelected={selectedEndpoint === endpoint}
                />
              ))}
          </TabsContent>

          <TabsContent value="post" className="space-y-3">
            {filteredEndpoints
              .filter((e) => e.method === 'POST')
              .map((endpoint, idx) => (
                <EndpointCard
                  key={idx}
                  endpoint={endpoint}
                  getMethodColor={getMethodColor}
                  onClick={() => setSelectedEndpoint(endpoint)}
                  isSelected={selectedEndpoint === endpoint}
                />
              ))}
          </TabsContent>

          <TabsContent value="patch" className="space-y-3">
            {filteredEndpoints
              .filter((e) => e.method === 'PATCH')
              .map((endpoint, idx) => (
                <EndpointCard
                  key={idx}
                  endpoint={endpoint}
                  getMethodColor={getMethodColor}
                  onClick={() => setSelectedEndpoint(endpoint)}
                  isSelected={selectedEndpoint === endpoint}
                />
              ))}
          </TabsContent>

          <TabsContent value="delete" className="space-y-3">
            {filteredEndpoints
              .filter((e) => e.method === 'DELETE')
              .map((endpoint, idx) => (
                <EndpointCard
                  key={idx}
                  endpoint={endpoint}
                  getMethodColor={getMethodColor}
                  onClick={() => setSelectedEndpoint(endpoint)}
                  isSelected={selectedEndpoint === endpoint}
                />
              ))}
          </TabsContent>
        </Tabs>
      </div>

      {/* Selected Endpoint Details */}
      {selectedEndpoint && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <Badge className={getMethodColor(selectedEndpoint.method)}>
                {selectedEndpoint.method}
              </Badge>
              <code className="text-lg">{selectedEndpoint.path}</code>
            </CardTitle>
            <CardDescription>{selectedEndpoint.description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="font-semibold mb-2">Details:</div>
              <div className="bg-muted p-3 rounded text-sm space-y-1">
                <p>
                  <strong>Method:</strong> {selectedEndpoint.method}
                </p>
                <p>
                  <strong>Path:</strong> {selectedEndpoint.path}
                </p>
                <p>
                  <strong>Auth Required:</strong> {selectedEndpoint.requiresAuth ? 'Yes' : 'No'}
                </p>
                {selectedEndpoint.collection && (
                  <p>
                    <strong>Collection:</strong> {selectedEndpoint.collection}
                  </p>
                )}
              </div>
            </div>
            <div>
              <Button onClick={() => window.open(`//${selectedEndpoint.path}`, '_blank')}>
                Test in Browser
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function EndpointCard({
  endpoint,
  getMethodColor,
  onClick,
  isSelected,
}: {
  endpoint: Endpoint;
  getMethodColor: (method: string) => string;
  onClick: () => void;
  isSelected: boolean;
}) {
  return (
    <Card
      className={`cursor-pointer transition ${isSelected ? 'ring-2 ring-blue-500' : ''}`}
      onClick={onClick}
    >
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 flex-1">
            <Badge className={getMethodColor(endpoint.method)}>{endpoint.method}</Badge>
            <div className="flex-1">
              <code className="font-mono text-sm">{endpoint.path}</code>
              <p className="text-xs text-muted-foreground mt-1">{endpoint.description}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {endpoint.requiresAuth && <Badge variant="outline">🔒 Auth</Badge>}
            {endpoint.collection && (
              <Badge variant="secondary">{endpoint.collection}</Badge>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
