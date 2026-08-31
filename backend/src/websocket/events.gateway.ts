import { WebSocketGateway, WebSocketServer, SubscribeMessage, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger, UseGuards } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@WebSocketGateway({
  cors: {
    origin: (origin: string, callback: Function) => {
      if (!origin) return callback(null, true);
      const allowed = (process.env.FRONTEND_URL || 'http://localhost:5173').split(',').map(s => s.trim());
      const isLocal = /^(http|https):\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);
      const isVercel = /^https:\/\/[a-z0-9-]+(?:\.[a-z0-9-]+)*\.vercel\.app$/i.test(origin);
      if (allowed.includes(origin) || isLocal || isVercel) return callback(null, true);
      callback(new Error('WebSocket CORS rejected'), false);
    },
    credentials: true,
  },
  namespace: '/events',
})
export class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;
  private logger = new Logger('EventsGateway');
  private userSockets = new Map<string, string[]>(); // userId -> socketIds

  constructor(private jwt: JwtService, private config: ConfigService) {}

  async handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth.token || client.handshake.query.token;
      if (!token) { client.disconnect(); return; }
      const payload = this.jwt.verify(token, { secret: this.config.get('JWT_SECRET') });
      client.data.userId = payload.sub;
      client.data.role = payload.role;

      const sockets = this.userSockets.get(payload.sub) || [];
      sockets.push(client.id);
      this.userSockets.set(payload.sub, sockets);

      client.join(`user:${payload.sub}`);
      client.join(`role:${payload.role}`);
      this.logger.log(`Client connected: ${client.id} (User: ${payload.sub}, Role: ${payload.role})`);
    } catch {
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    const userId = client.data.userId;
    if (userId) {
      const sockets = this.userSockets.get(userId) || [];
      const filtered = sockets.filter(id => id !== client.id);
      if (filtered.length) this.userSockets.set(userId, filtered);
      else this.userSockets.delete(userId);
    }
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  emitToUser(userId: string, event: string, data: any) {
    this.server.to(`user:${userId}`).emit(event, data);
  }

  emitToRole(role: string, event: string, data: any) {
    this.server.to(`role:${role}`).emit(event, data);
  }

  emitToAll(event: string, data: any) {
    this.server.emit(event, data);
  }

  @SubscribeMessage('join_room')
  handleJoinRoom(client: Socket, room: string) {
    client.join(room);
    return { status: 'joined', room };
  }
}
