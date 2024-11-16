import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const Article = sequelize.define(
  "Article",
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
    sub_judul: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
  },
  {
    tableName: "article",
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

export const syncDatabase = async () => {
  try {
    await Article.sync();
    console.log("Tabel Artikel telah disinkronisasi.");
  } catch (error) {
    console.error("Error saat menyinkronisasi tabel:", error);
  }
};

syncDatabase();

export default Article;
