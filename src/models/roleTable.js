import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const Role = sequelize.define(
  "Role",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    role_name: {
      type: DataTypes.STRING(30),
      allowNull: false,
      unique: true,
    },
  },
  {
    tableName: "roles",
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

// Sinkronisasi model dengan database
export const syncDatabase = async () => {
  try {
    await Role.sync();
    console.log("Tabel Role telah disinkronisasi.");
  } catch (error) {
    console.error("Error saat menyinkronisasi tabel:", error);
  }
};

// Seeder untuk tabel Role
const seedRoles = async () => {
  const rolesData = [{ role_name: "admin" }, { role_name: "user" }, { role_name: "dokter" }];

  try {
    // Bulk create data roles
    await Role.bulkCreate(rolesData, {
      ignoreDuplicates: true,
    });
    console.log("Data roles berhasil ditambahkan.");
  } catch (error) {
    console.error("Gagal menambahkan data roles:", error);
  }
};

// syncDatabase();
// seedRoles();

export default Role;
