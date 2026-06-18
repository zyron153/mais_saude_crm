import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";

@WebSocketGateway({ namespace: "/calendar", cors: { origin: "*" } })
export class AppointmentsGateway implements OnGatewayConnection {
  @WebSocketServer()
  server!: Server;

  handleConnection(client: Socket) {
    const clinicId = client.handshake.query["clinicId"] as string;
    if (clinicId) {
      client.join(`receptionist:${clinicId}`);
    }
  }

  @SubscribeMessage("joinRoom")
  joinRoom(
    @MessageBody() data: { clinicId: string },
    @ConnectedSocket() client: Socket
  ) {
    client.join(`receptionist:${data.clinicId}`);
  }

  emitAppointmentCreated(appointment: unknown) {
    this.server.emit("appointment:created", appointment);
  }

  emitAppointmentUpdated(appointment: unknown) {
    this.server.emit("appointment:updated", appointment);
  }
}
