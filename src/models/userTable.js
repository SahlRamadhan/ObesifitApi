// userTable.js
import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";
import Role from "./roleTable.js";
import bcrypt from "bcrypt";

const User = sequelize.define(
  "User",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(30),
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING(30),
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    images: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    refreshToken: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    telepon: {
      type: DataTypes.STRING(15),
      allowNull: true,
    },
    jenis_profesi: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    sertifikat: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    role_id: {
      type: DataTypes.INTEGER,
      references: {
        model: Role,
        key: "id",
      },
      allowNull: false,
    },
    otp: {
      type: DataTypes.STRING(10),
      allowNull: true,
    },
    otpExpires: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    isVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    isVerifiedByAdmin: {
      type: DataTypes.BOOLEAN,
      defaultValue: null,
    },
  },
  {
    tableName: "users",
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

// Definisikan relasi
User.belongsTo(Role, { foreignKey: "role_id", as: "role" });
Role.hasMany(User, { foreignKey: "role_id", as: "users" });

const createDummyAdmin = async () => {
  try {
    // Cari role dengan nama "admin"
    const adminRole = await Role.findOne({ where: { id: 1 } });

    if (!adminRole) {
      console.log('Role "admin" tidak ditemukan!');
      return;
    }

    const hashPassword = await bcrypt.hash("sahlramadan1111", 10);
    // Membuat data dummy user dengan role "admin"
    const dummyUser = await User.create({
      name: "Admin User",
      email: "admin@gmail.com",
      password: hashPassword,
      role_id: adminRole.id,
      isVerified: true,
      telepon: "08123456789",
      address: "Jl. Admin No. 1, Jakarta",
      refreshToken: null,
    });

    console.log("Data dummy admin berhasil ditambahkan:", dummyUser);
  } catch (error) {
    console.error("Error saat menambahkan data dummy:", error);
  }
};

// Sinkronisasi model dengan database
export const syncDatabase = async () => {
  try {
    await User.sync();

    // await createDummyAdmin();
    console.log("Tabel User telah disinkronisasi.");
  } catch (error) {
    console.error("Error saat menyinkronisasi tabel:", error);
  }
};

syncDatabase();

export default User;
