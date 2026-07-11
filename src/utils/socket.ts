import { Server } from "socket.io";

let io: Server;

export const initSocket = (server: any) => {
  io = new Server(server, {
    cors: { origin: "*" },
  });
};

export const getIO = () => io || (global as any).io;