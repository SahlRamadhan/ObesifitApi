import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const Video = sequelize.define(
  "Video",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    judul: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    deskripsi: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    tableName: "video",
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

export const syncDatabase = async () => {
  try {
    await Video.sync();
    console.log("Tabel Video telah disinkronisasi");
  } catch (error) {
    console.error("Error saat menyinkronisasi tabel:", error);
  }
};

syncDatabase();

export default Video;
