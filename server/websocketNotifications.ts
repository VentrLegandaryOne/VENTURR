import { WebSocketServer, WebSocket } from 'ws';
import { Server } from 'http';

interface NotificationMessage {
  type: 'comment' | 'mention' | 'project_update' | 'team_activity' | 'quote_sent';
  userId: string;
  title: string;
  message: string;
  resourceId: string;
  resourceType: string;
  timestamp: Date;
  data?: Record<string, any>;
}

interface ClientConnection {
  ws: WebSocket;
  userId: string;
  isAlive: boolean;
}

class NotificationManager {
  private wss: WebSocketServer;
  private clients: Map<string, ClientConnection[]> = new Map();

  constructor(server: Server) {
    this.wss = new WebSocketServer({ server });
    this.setupWebSocket();
    this.startHeartbeat();
  }

  private setupWebSocket() {
    this.wss.on('connection', (ws: WebSocket, req) => {
      const userId = this.extractUserId(req);
      if (!userId) {
        ws.close(1008, 'Unauthorized');
        return;
      }

      const connection: ClientConnection = { ws, userId, isAlive: true };
      
      if (!this.clients.has(userId)) {
        this.clients.set(userId, []);
      }
      this.clients.get(userId)!.push(connection);

      ws.on('pong', () => {
        connection.isAlive = true;
      });

      ws.on('close', () => {
        const userConnections = this.clients.get(userId) || [];
        const index = userConnections.indexOf(connection);
        if (index > -1) {
          userConnections.splice(index, 1);
        }
      });

      ws.on('error', (error) => {
        console.error('[WebSocket] Error:', error);
      });
    });
  }

  private startHeartbeat() {
    setInterval(() => {
      this.clients.forEach((connections) => {
        connections.forEach((connection) => {
          if (!connection.isAlive) {
            connection.ws.terminate();
            return;
          }
          connection.isAlive = false;
          connection.ws.ping();
        });
      });
    }, 30000);
  }

  public broadcast(notification: NotificationMessage) {
    const connections = this.clients.get(notification.userId) || [];
    const message = JSON.stringify(notification);

    connections.forEach((connection) => {
      if (connection.ws.readyState === WebSocket.OPEN) {
        connection.ws.send(message);
      }
    });
  }

  public broadcastToTeam(teamId: string, notification: NotificationMessage) {
    // Broadcast to all team members
    this.clients.forEach((connections, userId) => {
      const message = JSON.stringify({
        ...notification,
        teamId,
      });
      connections.forEach((connection) => {
        if (connection.ws.readyState === WebSocket.OPEN) {
          connection.ws.send(message);
        }
      });
    });
  }

  private extractUserId(req: any): string | null {
    const url = new URL(req.url, `http://${req.headers.host}`);
    return url.searchParams.get('userId');
  }
}

export default NotificationManager;
