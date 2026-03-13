import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";

export function connectSocket(token, onMessage, onConnect) {

  const client = new Client({

    // webSocketFactory: () => new SockJS("https://e2ee-chat.duckdns.org/api/ws"),
    webSocketFactory: () => new SockJS("https://e2ee-chat.duckdns.org/api/ws"),
    
    connectHeaders: {
      Authorization: "Bearer " + token
    },

    reconnectDelay: 5000,

    debug: (str) => {
      console.log("STOMP:", str);
    },

    onConnect: () => {

      console.log("WebSocket connected");

      client.subscribe("/user/queue/messages", (msg) => {

        const body = JSON.parse(msg.body);

        onMessage(body);

      });

      if (onConnect) {
        onConnect(client);
      }

    },

    onStompError: (frame) => {
      console.error("Broker error:", frame.headers["message"]);
      console.error("Details:", frame.body);
    },

    onWebSocketError: (error) => {
      console.error("WebSocket error:", error);
    }

  });

  client.activate();

  return client;
}