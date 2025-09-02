import { useState, useEffect } from 'react';
import { Bell, X, Clock, AlertCircle, CheckCircle, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Notification {
  id: string;
  type: 'overdue' | 'reminder' | 'streak' | 'achievement' | 'paused_session';
  title: string;
  description: string;
  timestamp: Date;
  isRead: boolean;
  actionable?: boolean;
  topicId?: string;
}

interface NotificationCenterProps {
  className?: string;
}

export const NotificationCenter = ({ className = '' }: NotificationCenterProps) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  // Mock notifications for demo
  useEffect(() => {
    const mockNotifications: Notification[] = [
      {
        id: '1',
        type: 'overdue',
        title: 'Topics Overdue',
        description: '3 topics are overdue for revision. Start catching up!',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        isRead: false,
        actionable: true,
      },
      {
        id: '2',
        type: 'paused_session',
        title: 'Paused Session Alert',
        description: 'Differential Calculus session paused for 25+ hours. Mark as complete?',
        timestamp: new Date(Date.now() - 25 * 60 * 60 * 1000), // 25 hours ago
        isRead: false,
        actionable: true,
        topicId: '1',
      },
      {
        id: '3',
        type: 'reminder',
        title: 'Daily Revision Reminder',
        description: 'Don\'t forget your daily revision goals! 5 topics due today.',
        timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
        isRead: false,
      },
      {
        id: '4',
        type: 'streak',
        title: 'Streak Milestone! 🔥',
        description: 'Congratulations! You\'ve maintained a 7-day revision streak.',
        timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
        isRead: true,
      },
      {
        id: '5',
        type: 'achievement',
        title: 'Weekly Goal Achieved! 🎉',
        description: 'You\'ve completed 180 minutes this week. Great job!',
        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
        isRead: true,
      },
    ];

    setNotifications(mockNotifications);
  }, []);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, isRead: true } : n)
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(n => ({ ...n, isRead: true }))
    );
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'overdue':
        return <AlertCircle className="h-4 w-4 text-destructive" />;
      case 'paused_session':
        return <Clock className="h-4 w-4 text-warning" />;
      case 'reminder':
        return <Calendar className="h-4 w-4 text-primary" />;
      case 'streak':
        return <span className="text-sm">🔥</span>;
      case 'achievement':
        return <CheckCircle className="h-4 w-4 text-success" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'overdue':
        return 'border-l-destructive bg-destructive/5';
      case 'paused_session':
        return 'border-l-warning bg-warning/5';
      case 'reminder':
        return 'border-l-primary bg-primary/5';
      case 'streak':
        return 'border-l-orange-500 bg-orange-50';
      case 'achievement':
        return 'border-l-success bg-success/5';
      default:
        return 'border-l-muted bg-muted/5';
    }
  };

  const formatTimeAgo = (timestamp: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - timestamp.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className={`relative ${className}`}>
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-0" align="end">
        <Card className="border-0 shadow-lg">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Notifications</CardTitle>
              {unreadCount > 0 && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={markAllAsRead}
                  className="text-xs text-muted-foreground hover:text-foreground"
                >
                  Mark all read
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-96">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No notifications yet</p>
                </div>
              ) : (
                <div className="space-y-1">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 border-l-4 cursor-pointer hover:bg-muted/50 transition-colors ${
                        getNotificationColor(notification.type)
                      } ${!notification.isRead ? 'bg-opacity-100' : 'bg-opacity-50'}`}
                      onClick={() => markAsRead(notification.id)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3 flex-1">
                          <div className="mt-1">
                            {getNotificationIcon(notification.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2">
                              <h4 className={`text-sm font-medium ${
                                !notification.isRead ? 'text-foreground' : 'text-muted-foreground'
                              }`}>
                                {notification.title}
                              </h4>
                              {!notification.isRead && (
                                <div className="w-2 h-2 rounded-full bg-primary" />
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                              {notification.description}
                            </p>
                            <p className="text-xs text-muted-foreground mt-2">
                              {formatTimeAgo(notification.timestamp)}
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeNotification(notification.id);
                          }}
                          className="h-6 w-6 p-0 opacity-50 hover:opacity-100"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </PopoverContent>
    </Popover>
  );
};