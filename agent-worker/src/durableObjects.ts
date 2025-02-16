export class CategoryUpdateHandler {
    connections: Set<WebSocket>;
  
    constructor() {
      this.connections = new Set();
    }
  
    async fetch(request: Request) {
      const upgradeHeader = request.headers.get("Upgrade");
      if (upgradeHeader !== "websocket") {
        return new Response("Expected a WebSocket request", { status: 400 });
      }
  
      const webSocketPair = new WebSocketPair();
      const clientSocket = webSocketPair[0]; // Client WebSocket
      const serverSocket = webSocketPair[1]; // Server WebSocket
  
      serverSocket.accept();
      
      this.connections.add(serverSocket);
      
      serverSocket.addEventListener("close", () => {
        this.connections.delete(serverSocket);
      });
  
      return new Response(null, {
        status: 101,
        webSocket: clientSocket
      });
    }
  
    async sendUpdate(update: any) {
      for (const socket of this.connections) {
        socket.send(JSON.stringify(update));
      }
    }
  }
  
  