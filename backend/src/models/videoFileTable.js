import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";
import Video from "./videoTable.js";

const VideoFile = sequelize.define(
  "VideoFile",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    video_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Video",
        key: "id",
      },
    },
    url: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    thumbnail: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    tableName: "video_file",
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

VideoFile.belongsTo(Video, { foreignKey: "video_id", as: "video", onDelete: "CASCADE" });

Video.hasMany(VideoFile, { foreignKey: "video_id", as: "video_files", onDelete: "CASCADE" });

export const syncDatabase = async () => {
  try {
    await VideoFile.sync();
    console.log("Tabel Video File telah disinkronisasi");
  } catch (error) {
    console.error("Error saat menyinkronisasi tabel:", error);
  }
};

syncDatabase();

export default VideoFile;
