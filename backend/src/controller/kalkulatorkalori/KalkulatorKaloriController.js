import KalkulatorKalori from "../../models/kalkulatorKaloriTable.js";
import JenisKelamin from "../../models/jenisKelaminTable.js";


export const createKalkulatorKalori = async (req, res) => {
  try {
    const { id_jenis_kelamin, berat_badan, tinggi_badan, usia, id_user } = req.body;

    
    if (!id_jenis_kelamin || !berat_badan || !tinggi_badan || !usia) {
      return res.status(400).json({ message: "Data tidak lengkap" });
    }

    // Cari data jenis kelamin
    const jenisKelamin = await JenisKelamin.findByPk(id_jenis_kelamin);
    if (!jenisKelamin) {
      return res.status(404).json({ message: "Jenis kelamin tidak ditemukan" });
    }

      
    let bmr;
    if (jenisKelamin.jenis_kelamin.toLowerCase() === "laki-laki") {
      bmr = 88.362 + 13.397 * berat_badan + 4.799 * tinggi_badan - 5.677 * usia;
    } else if (jenisKelamin.jenis_kelamin.toLowerCase() === "perempuan") {
      bmr = 447.593 + 9.247 * berat_badan + 3.098 * tinggi_badan - 4.33 * usia;
    } else {
      return res.status(400).json({ message: "Jenis kelamin tidak valid" });
      }
      

      const kalkulatorkalori = await KalkulatorKalori.create({
        id_user,
        id_jenis_kelamin,
        berat_badan,
        tinggi_badan,
        usia,
        bmr
      })
      
      res.status(201).json({
          message: "Kalkulator kalori berhasil dibuat",
          data: {
              bmr: bmr.toFixed(2),
              kalkulatorkalori
          }
      });
  } catch (error) {
      res.status(500).json({ message: "Kalkulator kalori gagal dibuat", serverMessage: error.message });
  }
};
