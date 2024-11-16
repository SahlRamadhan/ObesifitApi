import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";


const Kategori = sequelize.define(
    "Kategori",
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        kategori: {
            type: DataTypes.STRING(30),
            allowNull: false,
            unique: true,
        },
    },
    {
        tableName: "kategori",
        createdAt: "created_at",
        updatedAt: "updated_at",
    }
);


const syncDatabase = async () => {
  try {
    await Kategori.sync();
    console.log("Tabel Kategori telah disinkronisasi");
  } catch (error) {
    console.error("Error saat menyinkronisasi tabel:", error);
  }
};

// Data dummy
const seedKategori = async () => {
  try {
    const dataDummy = [
      { kategori: 'Kurus' },
      { kategori: 'Normal' },
      { kategori: 'Gemuk' },
      { kategori: 'Obesitas' },
    ];

    // Insert data menggunakan bulkCreate
    await Kategori.bulkCreate(dataDummy, { ignoreDuplicates: true });

    console.log('Data kategori berhasil ditambahkan!');
  } catch (error) {
    console.error('Error saat menambahkan data kategori:', error);
  }
};



// syncDatabase();
// seedKategori();


export default Kategori;