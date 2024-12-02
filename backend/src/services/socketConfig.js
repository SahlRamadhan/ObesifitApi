import Chat from "../models/chatTable.js"; // Model Chat
import User from "../models/userTable.js"; // Model User
import ConsultationSession from "../models/consultationSessionTable.js"; // Model ConsultationSession
import { Server } from "socket.io";

let io; // Variable untuk menyimpan instance Socket.IO

export const initializeSocket = (server) => {
  // Inisialisasi Socket.IO
  io = new Server(server, {
    cors: {
      origin: "http://localhost:5173", // Sesuaikan dengan domain frontend Anda
      methods: ["GET", "POST"],
    },
  });

  // Event untuk koneksi klien
  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    // Event: Bergabung ke room
    socket.on("joinRoom", (session_id) => {
      console.log(`User ${socket.id} joined room: ${session_id}`);
      socket.join(session_id);
    });

    // Event: Mengirim pesan
    socket.on("sendMessage", async (data, callback) => {
      try {
        console.log("Message received:", data);

        const { session_id, sender_id, message } = data;

        // Simpan pesan ke database
        const newMessage = await Chat.create({
          id_consultation_session: session_id,
          sender_id,
          message,
        });

        // Ambil data pengirim (relasi dengan User)
        const fullMessage = await Chat.findOne({
          where: { id: newMessage.id },
          include: [
            {
              model: User,
              as: "sender",
              attributes: ["id", "name", "images"], // Ambil hanya atribut yang diperlukan
            },
          ],
        });

        console.log("Message saved to database:", fullMessage);

        // Perbarui status sesi jika masih aktif
        const session = await ConsultationSession.findByPk(session_id);
        if (session && session.status === "inactive") {
          await ConsultationSession.update({ status: "active" }, { where: { id: session_id } });
        }

        // Broadcast pesan ke semua klien di room
        io.to(session_id).emit("receiveMessage", fullMessage);

        // Broadcast notifikasi pesan baru ke semua klien
        io.emit("newMessageNotification", {
          session_id,
          sender_name: fullMessage.sender.name,
          message,
        });

        // Kirim acknowledgment ke pengirim
        if (callback) {
          callback({ status: "success", message: "Message sent and saved successfully" });
        }
      } catch (error) {
        console.error("Error saving message:", error);

        // Kirim acknowledgment jika terjadi error
        if (callback) {
          callback({ status: "error", error: error.message });
        }
      }
    });

    // Event: Menghapus pesan
    socket.on("deleteMessage", async (messageId, callback) => {
      try {
        console.log(`Deleting message with ID: ${messageId}`);

        // Hapus pesan berdasarkan ID dari database
        const deleted = await Chat.destroy({ where: { id: messageId } });

        if (!deleted) {
          console.log("Message not found!");
          if (callback) {
            return callback({ status: "error", message: "Message not found" });
          }
          return;
        }

        console.log(`Message with ID: ${messageId} deleted successfully`);

        // Broadcast event penghapusan pesan ke semua klien di room yang sesuai
        io.emit("messageDeleted", { messageId });

        // Kirim acknowledgment sukses ke klien yang menghapus
        if (callback) {
          callback({ status: "success", message: "Message deleted successfully" });
        }
      } catch (error) {
        console.error("Error deleting message:", error);

        // Kirim acknowledgment jika terjadi error
        if (callback) {
          callback({ status: "error", message: error.message });
        }
      }
    });

    // Event: Handle disconnect
    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
    });
  });
};

// Fungsi untuk mengakses instance Socket.IO
export const getSocketIO = () => {
  if (!io) {
    throw new Error("Socket.IO is not initialized!");
  }
  return io;
};
