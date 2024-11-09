import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";
import Article from "./artikelTable.js";
import User from "./userTable.js";

const Ratting = sequelize.define(
  "Ratting",
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
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    rating: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
        max: 5,
      },
    },
  },
  {
    tableName: "rattings",
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

Ratting.belongsTo(Article, { foreignKey: "article_id", as: "article", onDelete: "CASCADE" });
Article.hasMany(Ratting, { foreignKey: "article_id", as: "rattings", onDelete: "CASCADE" });

Ratting.belongsTo(User, { foreignKey: "user_id", as: "users", onDelete: "CASCADE" });
User.hasMany(Ratting, { foreignKey: "user_id", as: "rattings", onDelete: "CASCADE" });

export const syncDatabase = async () => {
  try {
    await Ratting.sync();
    console.log("Tabel Ratting telah disinkronisasi.");
  } catch (error) {
    console.error("Error saat menyinkronisasi tabel:", error);
  }
};

syncDatabase();

export default Ratting;
