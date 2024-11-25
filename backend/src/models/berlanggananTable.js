import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";
import User from "./userTable.js";
import Status from "./statusTable.js";

const Berlangganan = sequelize.define(
  "Berlangganan",
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
    id_status: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Status,
        key: "id",
      },
    },
    code_pembayaran: {
      type: DataTypes.STRING(30),
      allowNull: false,
      unique: true,
    },
    jumlah_pembayaran: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    bukti_pembayaran: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    start_date: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    end_date: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    transaksi_date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  {
    tableName: "berlangganan",
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

Berlangganan.belongsTo(User, { foreignKey: "id_user", as: "user", onDelete: "CASCADE" });
Berlangganan.belongsTo(Status, { foreignKey: "id_status", as: "status", onDelete: "CASCADE" });

User.hasMany(Berlangganan, { foreignKey: "id_user", onDelete: "CASCADE" });
Status.hasMany(Berlangganan, { foreignKey: "id_status", onDelete: "CASCADE" });

const syncDatabase = async () => {
  try {
    await Berlangganan.sync();
    console.log("Tabel Berlangganan telah disinkronisasi.");
  } catch (error) {
    console.error("Error saat menyinkronisasi tabel:", error);
  }
};

syncDatabase();

export default Berlangganan;
