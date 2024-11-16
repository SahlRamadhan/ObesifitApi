import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";
import User from "./userTable.js";
import JenisKelamin from "./jenisKelaminTable.js";

const KalkulatorKalori = sequelize.define(
  "KalkulatorKalori",
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
    id_jenis_kelamin: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: JenisKelamin,
        key: "id",
      },
    },
    berat_badan: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    tinggi_badan: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    usia: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    bmr: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
  },
  {
    tableName: "kalkulator_kalori",
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

KalkulatorKalori.belongsTo(User, { foreignKey: "id_user" });
KalkulatorKalori.belongsTo(JenisKelamin, { foreignKey: "id_jenis_kelamin" });

User.hasMany(KalkulatorKalori, { foreignKey: "id_user" });
JenisKelamin.hasMany(KalkulatorKalori, { foreignKey: "id_jenis_kelamin" });

const syncDatabase = async () => {
  try {
    await KalkulatorKalori.sync();
    console.log("Connection has been established successfully.");
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  }
};

syncDatabase();

export default KalkulatorKalori;
