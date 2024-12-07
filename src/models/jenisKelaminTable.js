import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const JenisKelamin = sequelize.define(
  "JenisKelamin",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    jenis_kelamin: {
      type: DataTypes.STRING(30),
      allowNull: false,
      unique: true,
    },
  },
  {
    tableName: "jenis_kelamin",
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

const syncDatabase = async () => {
  try {
    await JenisKelamin.sync();
    console.log("Tabel Jenis Kelamin telah disinkronisasi.");
  } catch (error) {
    console.error("Error saat menyinkronisasi tabel:", error);
  }
};

// Data dummy
const seedJenisKelamin = async () => {
  try {
    const dataDummy = [{ jenis_kelamin: "Laki-Laki" }, { jenis_kelamin: "Perempuan" }];

    // Insert data menggunakan bulkCreate
    await JenisKelamin.bulkCreate(dataDummy, { ignoreDuplicates: true });

    console.log("Data jenis kelamin berhasil ditambahkan!");
  } catch (error) {
    console.error("Error saat menambahkan data jenis kelamin:", error);
  }
};

// syncDatabase();
// seedJenisKelamin();

export default JenisKelamin;