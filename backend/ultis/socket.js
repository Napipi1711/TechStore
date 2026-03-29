import { Server } from "socket.io";
import Sale from "../models/Sale.js"; 

let io;

export const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: "*", // dev + ngrok
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log("🟢 Client connected:", socket.id);

    // ===== JOIN ROOM THEO SALE =====
    socket.on("join_sale", async (saleId) => {
      try {
        if (!saleId) return;

        const roomId = saleId.toString();

        socket.join(roomId);
        console.log(`📡 Joined room: ${roomId}`);

        // 🔥 FIX QUAN TRỌNG: tránh miss event
        const sale = await Sale.findById(roomId);

        if (sale?.status === "paid") {
          console.log("⚡ Emit lại do join trễ:", roomId);

          socket.emit("payment_success", {
            saleId: roomId,
            status: "paid",
          });
        }
      } catch (err) {
        console.error("❌ join_sale error:", err.message);
      }
    });

    // ===== DEBUG LIST ROOMS =====
    socket.on("debug_rooms", () => {
      console.log("📦 Rooms:", socket.rooms);
    });

    // ===== DISCONNECT =====
    socket.on("disconnect", () => {
      console.log("🔴 Client disconnected:", socket.id);
    });
  });
};

// ===== GET IO INSTANCE =====
export const getIO = () => {
  if (!io) {
    throw new Error("❌ Socket chưa được init!");
  }
  return io;
};