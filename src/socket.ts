import { Server, Socket } from "socket.io";

interface ConnectedUser {
  socketId: string;
  username: string;
}

export function handleSockets(io: Server) {
  // Lista de usuarios conectados
  let users: ConnectedUser[] = [];

  function broadcastUsers() {
    io.emit("users:update", users);
  }

  io.on("connection", (socket: Socket) => {
    // Cuando el usuario hace join, guarda el username y actualiza la lista
    socket.on("join", ({ username }) => {
      socket.data.username = username;
      // Evita duplicados por reconexión
      users = users.filter(u => u.socketId !== socket.id);
      users.push({ socketId: socket.id, username });
      broadcastUsers();
    });

    // Cuando se desconecta, elimina de la lista y actualiza
    socket.on("disconnect", () => {
      users = users.filter(u => u.socketId !== socket.id);
      broadcastUsers();
    });

    // (Opcional) Si quieres emitir la lista al conectar aunque no haya hecho join
    socket.emit("users:update", users);
  });
}