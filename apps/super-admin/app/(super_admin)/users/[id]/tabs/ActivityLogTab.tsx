import { Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card";

interface ActivityLogTabProps {
  userId: string;
}

const ActivityLogTab: React.FC<ActivityLogTabProps> = ({ userId }) => {
  // This would normally fetch activity logs from the database
  const activityLogs = [
    { id: 1, action: "Inicio de sesión", timestamp: "2023-10-15T14:30:00Z", ip: "192.168.1.1" },
    { id: 2, action: "Cambio de contraseña", timestamp: "2023-10-10T09:15:00Z", ip: "192.168.1.1" },
    { id: 3, action: "Actualización de perfil", timestamp: "2023-09-28T16:45:00Z", ip: "192.168.1.2" },
  ];

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-4">
      <p className="text-muted-foreground">
        Historial de actividad reciente del usuario en la plataforma
      </p>
      
      {activityLogs.length > 0 ? (
        <div className="space-y-3">
          {activityLogs.map((log) => (
            <Card key={log.id}>
              <CardContent className="p-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 text-muted-foreground mr-2" />
                    <span className="font-medium">{log.action}</span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {formatDate(log.timestamp)}
                  </div>
                </div>
                <div className="text-sm text-muted-foreground mt-2">
                  IP: {log.ip}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center p-6">
          <p className="text-muted-foreground">No hay registros de actividad disponibles</p>
        </div>
      )}
    </div>
  );
};

export default ActivityLogTab;
