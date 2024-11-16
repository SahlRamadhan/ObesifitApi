import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";
import User from "./userTable.js";
import Kategori from "./kategoriTable.js";
import JenisKelamin from "./jenisKelaminTable.js";

const KalkulatorBMITable = sequelize.define(
  "KalkulatorBMI",
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
    id_kategori: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Kategori,
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
    usia: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    tinggi_badan: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    berat_badan: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    bmi: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
  },
  {
    tableName: "kalkulator_bmi",
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

KalkulatorBMITable.belongsTo(User, { foreignKey: "id_user" });
KalkulatorBMITable.belongsTo(Kategori, { foreignKey: "id_kategori" });
KalkulatorBMITable.belongsTo(JenisKelamin, { foreignKey: "id_jenis_kelamin" });

User.hasMany(KalkulatorBMITable, { foreignKey: "id_user" });
Kategori.hasMany(KalkulatorBMITable, { foreignKey: "id_kategori" });
JenisKelamin.hasMany(KalkulatorBMITable, { foreignKey: "id_jenis_kelamin" });

export const syncDatabase = async () => {
  try {
    await KalkulatorBMITable.sync();
  } catch (error) {
    console.error("Error syncing database:", error);
  }
};

syncDatabase();
export default KalkulatorBMITable;
