import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";
import Article from "./artikelTable.js";

const ArticleFile = sequelize.define(
  "ArticleFile",
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
    images: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    thumbnail: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    tableName: "artikel_files",
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

ArticleFile.belongsTo(Article, { foreignKey: "article_id", as: "article", onDelete: "CASCADE" });

Article.hasMany(ArticleFile, { foreignKey: "article_id", as: "articles_files", onDelete: "CASCADE" });

const syncDatabase = async () => {
  try {
    await ArticleFile.sync();
    console.log("Tabel ArticleFile telah disinkronisasi.");
  } catch (error) {
    console.error("Error saat menyinkronisasi tabel:", error);
  }
};

syncDatabase();
export default ArticleFile;
