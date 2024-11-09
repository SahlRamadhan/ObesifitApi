import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";
import Article from "./artikelTable.js";

const Gambar = sequelize.define(
  "Gambar",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    article_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Article,
        key: "id",
      },
    },
    url: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    deskripsi: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    urutan: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  },
  {
    tableName: "gambar",
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

Gambar.belongsTo(Article, { foreignKey: "article_id", as: "article", onDelete: "CASCADE" });
Article.hasMany(Gambar, { foreignKey: "article_id", as: "gambar", onDelete: "CASCADE" });

export const syncDatabase = async () => {
  try {
    await Gambar.sync();
    console.log("Tabel Gambar telah disinkronisasi.");
  } catch (error) {
    console.error("Error saat menyinkronisasi tabel:", error);
  }
};

syncDatabase();

export default Gambar;
