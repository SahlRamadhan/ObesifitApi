import Chat from "../../models/chatTable.js";
import ConsultationSession from "../../models/consultationSessionTable.js";


export const createChat = async (req, res) => {
    try {
        const { id_user, id_doctor } = req.body;
         let session = await ConsultationSession.findOne({
           where: { id_user, id_doctor, status: "active" },
         });

         if (!session) {
           session = await ConsultationSession.create({ id_user, id_doctor, status: "active" });
        }
        
        res.status(200).json({ message: "Chat created successfully", session });
    } catch (error) {
        res.status(500).json({ message: "Failed to create chat", error });
    }
};

export const fetchSession = async (req, res) => {
    try {
       const { role, id } = req.params;

       let sessions = [];
       if (role === "dokter") {
         sessions = await ConsultationSession.findAll({ where: { id_doctor: id, status: "active" } });
       } else if (role === "user") {
         sessions = await ConsultationSession.findAll({ where: { id_user: id, status: "active" } });
       }

       res.status(200).json({ message: "Chat fetched successfully", sessions });
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch chat", error });
    }
};

export const fetchChat = async (req, res) => {
    try {
        const { id } = req.params;
        const chat = await Chat.findAll({ where: { id_consultation_session: id } });
        res.status(200).json({ message: "Chat fetched successfully", chat });
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch chat", error });
    }
};

export const sendMessage = async (req, res) => {
    try {
        const { id_consultation_session, sender_id, message } = req.body;
        const chat = await Chat.create({ id_consultation_session, sender_id, message });
        res.status(200).json({ message: "Message sent successfully", chat });
    } catch (error) {
        res.status(500).json({ message: "Failed to send message", error });
    }
};

