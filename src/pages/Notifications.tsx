import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Bell, Trash2, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
}

export default function Notifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');

  // Initialize with sample notifications
  useEffect(() => {
    const sampleNotifications: Notification[] = [
      {
        id: '1',
        type: 'success',
        title: 'Record Created',
        message: 'Successfully created a new post record',
        timestamp: new Date(Date.now() - 5 * 60000),
        read: false,
      },
      {
        id: '2',
        type: 'info',
        title: 'Collection Updated',
        message: 'The "products" collection schema was updated',
        timestamp: new Date(Date.now() - 15 * 60000),
        read: false,
      },
      {
        id: '3',
        type: 'success',
        title: 'User Added',
        message: 'New user "john@example.com" was successfully created',
        timestamp: new Date(Date.now() - 1 * 3600000),
        read: true,
      },
      {
        id: '4',
        type: 'warning',
        title: 'System Update',
        message: 'A new version of NovaCMS is available',
        timestamp: new Date(Date.now() - 2 * 3600000),
        read: true,
      },
      {
        id: '5',
        type: 'info',
        title: 'Backup Completed',
        message: 'Daily backup was completed successfully',
        timestamp: new Date(Date.now() - 24 * 3600000),
        read: true,
      },
    ];
    setNotifications(sampleNotifications);
  }, []);

  const getIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'error':
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      case 'warning':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      case 'info':
        return <Info className="h-5 w-5 text-blue-500" />;
      default:
        return <Bell className="h-5 w-5" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'bg-green-600/20 border-green-500 text-green-300';
      case 'error':
        return 'bg-red-600/20 border-red-500 text-red-300';
      case 'warning':
        return 'bg-yellow-600/20 border-yellow-500 text-yellow-300';
      case 'info':
        return 'bg-blue-600/20 border-blue-500 text-blue-300';
      default:
        return 'bg-gray-600/20 border-gray-500 text-gray-300';
    }
  };

  const markAsRead = (id: string) => {
    setNotifications(
      notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n
      )
    );
    toast.success('Marked as read');
  };

  const markAsUnread = (id: string) => {
    setNotifications(
      notifications.map((n) =>
        n.id === id ? { ...n, read: false } : n
      )
    );
  };

  const deleteNotification = (id: string) => {
    setNotifications(notifications.filter((n) => n.id !== id));
    toast.success('Notification deleted');
  };

  const clearAll = () => {
    if (window.confirm('Clear all notifications?')) {
      setNotifications([]);
      toast.success('All notifications cleared');
    }
  };

  const filteredNotifications = notifications.filter((n) => {
    if (filter === 'unread') return !n.read;
    if (filter === 'read') return n.read;
    return true;
  });

  const unreadCount = notifications.filter((n) => !n.read).length;

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="w-full space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Bell className="h-8 w-8" />
            Notifications
          </h1>
          <p className="text-muted-foreground">
            Stay updated with system and activity notifications
          </p>
        </div>
        {unreadCount > 0 && (
          <Badge variant="destructive" className="text-lg px-3 py-1">
            {unreadCount} New
          </Badge>
        )}
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Activity Feed</CardTitle>
              <CardDescription>
                Recent system and user activities
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={clearAll}
              disabled={notifications.length === 0}
            >
              Clear All
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {notifications.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No notifications yet</p>
            </div>
          ) : (
            <>
              <Tabs value={filter} onValueChange={(v: any) => setFilter(v)} className="w-full">
                <TabsList className="grid w-full grid-cols-3 mb-4">
                  <TabsTrigger value="all">
                    All ({notifications.length})
                  </TabsTrigger>
                  <TabsTrigger value="unread">
                    Unread ({unreadCount})
                  </TabsTrigger>
                  <TabsTrigger value="read">
                    Read ({notifications.length - unreadCount})
                  </TabsTrigger>
                </TabsList>

                <TabsContent value={filter} className="space-y-3">
                  {filteredNotifications.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      No {filter} notifications
                    </div>
                  ) : (
                    filteredNotifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`p-4 rounded-lg border transition-all ${getTypeColor(
                          notification.type
                        )} ${!notification.read ? 'border-l-4' : ''}`}
                      >
                        <div className="flex items-start gap-3">
                          <div className="mt-1">
                            {getIcon(notification.type)}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <h3 className="font-semibold">
                                  {notification.title}
                                  {!notification.read && (
                                    <span className="ml-2 inline-block w-2 h-2 bg-current rounded-full" />
                                  )}
                                </h3>
                                <p className="text-sm opacity-90 mt-1">
                                  {notification.message}
                                </p>
                              </div>
                            </div>
                            <p className="text-xs opacity-75 mt-2">
                              {formatTime(notification.timestamp)}
                            </p>
                          </div>

                          <div className="flex gap-2 ml-4">
                            {!notification.read ? (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => markAsRead(notification.id)}
                                className="text-xs"
                              >
                                Read
                              </Button>
                            ) : (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => markAsUnread(notification.id)}
                                className="text-xs"
                              >
                                Unread
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteNotification(notification.id)}
                              className="text-xs text-red-500 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </TabsContent>
              </Tabs>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
