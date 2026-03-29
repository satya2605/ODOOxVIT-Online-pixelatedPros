import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Clock, Beaker, CheckCircle2, User, Play, AlertCircle } from 'lucide-react';

interface ActivityEvent {
  id: string;
  type: 'submit' | 'approve' | 'reject' | 'rule_trigger' | 'system';
  message: string;
  timestamp: Date;
  user?: string;
}

interface ActivityFeedProps {
  events: ActivityEvent[];
}

export function ActivityFeed({ events }: ActivityFeedProps) {
  const getIconForType = (type: string) => {
    switch (type) {
      case 'submit': return <User className="w-4 h-4 text-blue-500" />;
      case 'approve': return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case 'reject': return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'rule_trigger': return <Beaker className="w-4 h-4 text-purple-500" />;
      case 'system': return <Play className="w-4 h-4 text-gray-400" />;
      default: return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  return (
    <Card className="h-[400px] flex flex-col">
      <CardHeader className="py-4 border-b">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <Clock className="w-4 h-4" />
          Activity Log
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 p-0 overflow-hidden">
        <ScrollArea className="h-full px-4 py-3">
          <div className="space-y-4">
            {events.map((event, i) => (
              <div key={event.id} className="relative pl-6">
                {/* Connecting line */}
                {i < events.length - 1 && (
                  <span className="absolute left-[11px] top-6 bottom-[-24px] w-px bg-border" />
                )}
                
                {/* Icon wrapper */}
                <div className="absolute left-0 top-1 w-6 h-6 rounded-full bg-muted flex items-center justify-center border border-background">
                  {getIconForType(event.type)}
                </div>

                <div className="flex flex-col gap-0.5 mt-0.5">
                  <p className="text-sm text-foreground font-medium leading-snug">
                    {event.message}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                    {event.user && (
                       <span>{event.user} &bull;</span>
                    )}
                    <span>{event.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>
              </div>
            ))}
            {events.length === 0 && (
              <div className="text-sm text-muted-foreground text-center py-4">
                No activity yet
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
