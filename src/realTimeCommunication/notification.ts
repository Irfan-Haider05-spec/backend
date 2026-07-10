import WebSocket from "ws";

// clients map share করতে পারেন chat থেকে অথবা আলাদা
export const notificationClients = new Map<string, WebSocket>();

interface WSMessage {
  type: string;
  data: any;
}

// Incoming notification events
export async function notificationHandler(ws: WebSocket, msg: WSMessage) {
  const userId = msg.data?.userId;

  // Authentication (optional, similar chat-auth)
  if (msg.type === "notification-auth") {
    if (!userId) {
      ws.send(JSON.stringify({ type: "error", data: "UserId missing" }));
      ws.close();
      return;
    }
    notificationClients.set(userId, ws);
    ws.send(JSON.stringify({ type: "connected", data: "Notification connected" }));

    return;
  }

  // Example: send test notification
  if (msg.type === "notification-test") {
    ws.send(JSON.stringify({ type: "notification", data: { message: "Test notification!" } }));
  }
}

// Helper to send notification to a user
export function sendNotification(userId: string, payload: any) {
  const ws = notificationClients.get(userId);
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({ type: "notification", data: payload }));
  }
}

// Broadcast notification to all connected users
export function broadcastNotification(payload: any) {
  for (const ws of notificationClients.values()) {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: "notification", data: payload }));
    }
  }
}
