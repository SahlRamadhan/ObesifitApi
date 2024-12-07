import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";
import ConsultationSession from "./consultationSessionTable.js";
import User from "./userTable.js";

const Chat = sequelize.define(
  "Chat",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    id_consultation_session: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: ConsultationSession,
        key: "id",
      },
    },
    sender_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
  },
  {
    tableName: "chat",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

Chat.belongsTo(ConsultationSession, { foreignKey: "id_consultation_session", as: "consultation_session", });
Chat.belongsTo(User, { foreignKey: "sender_id", as: "sender" });

ConsultationSession.hasMany(Chat, { foreignKey: "id_consultation_session", as: "chat", });
User.hasMany(Chat, { foreignKey: "sender_id", as: "messages" });


const syncDatabase = async () => {
  try {
    await Chat.sync();
    console.log("Database synced successfully");
  } catch (error) {
    console.error("Error syncing database:", error);
  }
}

syncDatabase();
export default Chat;
