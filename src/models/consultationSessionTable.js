import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";
import User from "./userTable.js";

const ConsultationSession = sequelize.define(
  "ConsultationSession",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    id_user: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: User,
        key: "id",
      },
    },
    id_doctor: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: User,
        key: "id",
      },
    },
    status: {
      type: DataTypes.ENUM("active", "inactive"),
      defaultValue: "active",
    },
  },
  {
    tableName: "consultation_session",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

ConsultationSession.belongsTo(User, { foreignKey: "id_user", as: "user" });
ConsultationSession.belongsTo(User, { foreignKey: "id_doctor", as: "doctor" });

User.hasMany(ConsultationSession, { foreignKey: "id_user", as: "user" });
User.hasMany(ConsultationSession, { foreignKey: "id_doctor", as: "doctor" });

const syncDatabase = async () => {
  try {
    await ConsultationSession.sync();
    console.log("Database synced successfully");
  } catch (error) {
    console.error("Error syncing database:", error);
  }
};

syncDatabase();
export default ConsultationSession;
