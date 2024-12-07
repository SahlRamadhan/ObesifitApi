import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const Status = sequelize.define(
  "Status",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    status: {
      type: DataTypes.STRING(30),
      allowNull: false,
      unique: true,
    },
  },
  {
    tableName: "status",
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

const seedStatus = async () => {
  try {
    await Status.bulkCreate([{ status: "pending" }, { status: "approved" }, { status: "rejected" }, { status: "expired" }]);
    console.log("Status table seeded successfully.");
  } catch (error) {
    console.error("Error seeding status table:", error);
  }
};

const syncDatabase = async () => {
  try {
    await Status.sync();
    console.log("Tabel Status telah disinkronisasi.");
  } catch (error) {
    console.error("Error saat menyinkronisasi tabel:", error);
  }
};

// syncDatabase();
// seedStatus();
export default Status;
