import WebSocket, { WebSocketServer } from "ws";
import { notificationHandler } from "./notification";


// Map share করতে চাইলে export করতে পারেন (optional)
export const clients = new Map<string, WebSocket>();

// WebSocket server setup function
export function setupWebSocketServer(serverOrPort: any) {
  // যদি number দেন → নতুন port, যদি HTTP server দেন → attach
  const wss =
    typeof serverOrPort === "number"
      ? new WebSocketServer({ port: serverOrPort })
      : new WebSocketServer({ server: serverOrPort });



  wss.on("connection", (ws: WebSocket) => {
    ws.on("message", async (message: string) => {
      const msg = JSON.parse(message);

      // আলাদা handler call

      if (msg.type.startsWith("notification")) await notificationHandler(ws, msg);
    
    });
  });

  return wss;
}
