import Chat from "../../models/chatTable.js";
import ConsultationSession from "../../models/consultationSessionTable.js";
import User from "../../models/userTable.js";

export const createChat = async (req, res) => {
  try {
    const { id_user, id_doctor } = req.body;

    // Cari sesi yang ada (termasuk yang sudah "inactive")
    let session = await ConsultationSession.findOne({
      where: { id_user, id_doctor },
    });

    if (session) {
      // Jika sesi ditemukan, ubah status menjadi "active"
      await session.update({ status: "active" });
    } else {
      // Jika tidak ada sesi, buat sesi baru
      session = await ConsultationSession.create({ id_user, id_doctor, status: "active" });
    }

    res.status(200).json({ message: "Chat session created or resumed successfully", session });
  } catch (error) {
    res.status(500).json({ message: "Failed to create or resume chat session", error });
  }
};

export const fetchSession = async (req, res) => {
  try {
    const { role, id } = req.params;

    let sessions = [];
    if (role === "dokter") {
      sessions = await ConsultationSession.findAll({
        where: { id_doctor: id, status: "active" },
        include: [{ model: User, as: "user", attributes: ["id", "name", "images"] }],
      });
    } else if (role === "user") {
      sessions = await ConsultationSession.findAll({
        where: { id_user: id, status: "active" },
        include: [{ model: User, as: "doctor", attributes: ["id", "name", "images"] }],
      });
    }

    res.status(200).json({ sessions });
  } catch (error) {
    console.error("Error fetching sessions:", error);
    res.status(500).json({ message: "Failed to fetch sessions", error: error.message });
  }
};

export const fetchChat = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const chat = await Chat.findAll({ where: { id_consultation_session: sessionId }, include: [{ model: User, as: "sender", attributes: ["id", "name", "images"] }], order: [["created_At", "ASC"]] });
    res.status(200).json({ message: "Chat fetched successfully", chat });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch chat", error });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { id_consultation_session, sender_id, message } = req.body;
    const chat = await Chat.create({ id_consultation_session, sender_id, message });

    // Ambil data sender
    const sender = await User.findByPk(sender_id, {
      attributes: ["id", "name", "images"],
    });

    res.status(200).json({
      message: "Message sent successfully",
      chat: { ...chat.dataValues, sender },
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to send message", error });
  }
};

// Menutup Sesi Konsultasi
export const closeSession = async (req, res) => {
  try {
    const { sessionId } = req.params;

    // Cari sesi berdasarkan ID
    const session = await ConsultationSession.findByPk(sessionId);

    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }

    // Update status sesi menjadi "inactive"
    await ConsultationSession.update(
      { status: "inactive" }, // Data yang akan diupdate
      { where: { id: sessionId } } // Kondisi untuk memastikan hanya sesi yang sesuai diupdate
    );

    res.status(200).json({ message: "Session closed successfully" });
  } catch (error) {
    console.error("Error closing session:", error);
    res.status(500).json({ message: "Failed to close session", error });
  }
};

// Menghapus Pesan
export const deleteSessionAndMessages = async (req, res) => {
  try {
    const { sessionId } = req.params;
  
    // Cari sesi konsultasi berdasarkan ID
    const session = await ConsultationSession.findByPk(sessionId);

    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }

    // Hapus semua pesan yang terkait dengan sesi ini
    await Chat.destroy({ where: { id_consultation_session: sessionId } });

    // Hapus sesi konsultasi
    await ConsultationSession.destroy({ where: { id: sessionId } });

    res.status(200).json({ message: "Session and messages deleted successfully" });
  } catch (error) {
    console.error("Error deleting session and messages:", error);
    res.status(500).json({ message: "Failed to delete session and messages", error });
  }
};

export const getAllSessions = async (req, res) => {
  try {
    // Ambil semua sesi konsultasi, termasuk data user dan dokter
    const sessions = await ConsultationSession.findAll({
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "name", "images"], // Data user terkait
        },
        {
          model: User,
          as: "doctor",
          attributes: ["id", "name", "images"], // Data dokter terkait
        },
      ],
      order: [["updated_at", "DESC"]], // Urutkan berdasarkan waktu terakhir diperbarui
    });

    res.status(200).json({ sessions });
  } catch (error) {
    console.error("Error fetching sessions:", error);
    res.status(500).json({ message: "Failed to fetch sessions", error: error.message });
  }
};
