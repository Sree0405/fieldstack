import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Database, Users, FileText, Activity, ArrowRight, Plus, TrendingUp } from "lucide-react";
import { apiClient } from "@/integrations/api/client";

interface MetricsData {
  users: number;
  collections: number;
  fields: number;
  permissions: number;
}

interface Collection {
  id: string;
  name: string;
  displayName: string;
  tableName?: string;
  fields?: Array<{ id: string; name: string; type: string }>;
  createdAt?: string;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [metrics, setMetrics] = useState<MetricsData | null>(null);
  const [role, setRole] = useState<number | 0>(0);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        // Fetch metrics
        const metricsRes = await apiClient.getSystemMetrics();
        if (metricsRes.data) {
          setMetrics(metricsRes.data);
          console.log("Metrics data:", metricsRes.data);
        }
        const roles = await apiClient.getAllRoles();
        if (roles.data) {
          setRole(roles.data.length);
        }
        // Fetch collections
        const collectionsRes = await apiClient.getCollections();
        if (collectionsRes.data) {
          setCollections(collectionsRes.data.slice(0, 5)); // Show top 5
        }
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setError("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const statCards = [
    {
      title: "Collections",
      value: metrics?.collections || 0,
      icon: Database,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
      change: "Total data models",
    },
    {
      title: "Fields",
      value: metrics?.fields || 0,
      icon: FileText,
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
      change: "Total fields",
    },
    {
      title: "Users",
      value: metrics?.users || 0,
      icon: Users,
      color: "text-green-500",
      bgColor: "bg-green-500/10",
      change: "Team members",
    },
    {
      title: "Roles",
      value: role || 0,
      icon: Activity,
      color: "text-orange-500",
      bgColor: "bg-orange-500/10",
      change: "Permission types",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Welcome to fieldstack - Your headless content management system
        </p>
      </div>

      {error && (
        <Card className="p-4 bg-red-50  border-red-200">
          <p className="text-sm text-red-800">{error}</p>
        </Card>
      )}

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Card key={stat.title} className="p-6 hover:shadow-md transition-shadow">
            {loading ? (
              <div className="space-y-3">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-8 w-16" />
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`rounded-lg ${stat.bgColor} p-2`}>
                      <stat.icon className={`h-5 w-5 ${stat.color}`} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        {stat.title}
                      </p>
                      <p className="text-2xl font-bold text-foreground">
                        {stat.value}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">{stat.change}</p>
                  <TrendingUp className="h-4 w-4 text-green-500" />
                </div>
              </>
            )}
          </Card>
        ))}
      </div>

      {/* Collections & Quick Actions */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Recent Collections */}
        <Card className="col-span-2 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-foreground">Recent Collections</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/collections")}
              className="text-primary hover:bg-primary/10"
            >
              View All <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-12 w-full" />
                </div>
              ))}
            </div>
          ) : collections.length > 0 ? (
            <div className="space-y-3">
              {collections.map((collection) => (
                <div
                  key={collection.id}
                  className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors cursor-pointer"
                  onClick={() => navigate(`/content?collection=${collection.name}`)}
                >
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {collection.displayName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {collection.fields?.length || 0} fields
                      {collection.createdAt && ` · Created ${new Date(collection.createdAt).toLocaleDateString()}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                      {collection.fields?.length || 0}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Database className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">No collections yet</p>
            </div>
          )}
        </Card>

        {/* Quick Actions */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h3>
          <div className="grid gap-3">
            <Button
              variant="outline"
              className="justify-start h-auto flex-col items-start p-3 border-border hover:bg-accent/50"
              onClick={() => navigate("/collections")}
            >
              <div className="flex items-center gap-2 w-full">
                <Plus className="h-4 w-4" />
                <span>Create Collection</span>
              </div>
              <span className="text-xs text-muted-foreground mt-1">Add a new data model</span>
            </Button>

            <Button
              variant="outline"
              className="justify-start h-auto flex-col items-start p-3 border-border hover:bg-accent/50"
              onClick={() => navigate("/users")}
            >
              <div className="flex items-center gap-2 w-full">
                <Users className="h-4 w-4" />
                <span>Manage Users</span>
              </div>
              <span className="text-xs text-muted-foreground mt-1">Add or edit team members</span>
            </Button>

            <Button
              variant="outline"
              className="justify-start h-auto flex-col items-start p-3 border-border hover:bg-accent/50"
              onClick={() => navigate("/content")}
            >
              <div className="flex items-center gap-2 w-full">
                <FileText className="h-4 w-4" />
                <span>Browse Content</span>
              </div>
              <span className="text-xs text-muted-foreground mt-1">View all records</span>
            </Button>
          </div>
        </Card>
      </div>

      {/* System Info */}
      <Card className="p-6 bg-accent/50">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-foreground">System Status</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Your CMS is running smoothly with real-time data updates
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-green-500 animate-pulse"></div>
            <span className="text-sm font-medium text-green-600">Active</span>
          </div>
        </div>
      </Card>
    </div>
  );
}
