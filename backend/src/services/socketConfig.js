import { Server } from "socket.io";

let io; // Variable untuk menyimpan instance Socket.IO

export const initializeSocket = (server) => {
  // Inisialisasi Socket.IO dengan server HTTP
  io = new Server(server, { cors: { origin: "*" } });

  // Handle koneksi
  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    // User bergabung ke room berdasarkan session_id
    socket.on("joinRoom", (session_id) => {
      console.log(`User ${socket.id} joined room: ${session_id}`);
      socket.join(session_id);
    });

    // Menerima pesan dari client
    socket.on("sendMessage", (data) => {
      console.log("Message received:", data);

      // Broadcast pesan ke semua client dalam room yang sama
      io.to(data.session_id).emit("receiveMessage", data);
    });

    // Handle disconnect
    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
    });
  });
};

// Fungsi untuk mengakses instance Socket.IO di bagian lain aplikasi
export const getSocketIO = () => {
  if (!io) {
    throw new Error("Socket.IO is not initialized!");
  }
  return io;
};
