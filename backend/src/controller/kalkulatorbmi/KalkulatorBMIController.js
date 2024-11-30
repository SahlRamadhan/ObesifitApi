import KalkulatorBMITable from "../../models/kalkulatorBMITbable.js";
import Kategori from "../../models/kategoriTable.js";
import JenisKelamin from "../../models/jenisKelaminTable.js";

export const createKalkulatorBMI = async (req, res) => {
  try {
    const { id_jenis_kelamin, berat_badan, tinggi_badan, usia, id_user } = req.body;

    

    if (!id_jenis_kelamin || !berat_badan || !tinggi_badan || !usia) {
      return res.status(400).json({ message: "Data tidak lengkap" });
    }

    const bmi = berat_badan / ((tinggi_badan / 100) * (tinggi_badan / 100));

    let id_kategori, kategori;
    if (bmi < 18.5) {
      id_kategori = 1;
      kategori = "Kurus";
    } else if (bmi < 25) {
      id_kategori = 2;
      kategori = "Normal";
    } else if (bmi < 30) {
      id_kategori = 3;
      kategori = "Gemuk";
    } else {
      id_kategori = 4;
      kategori = "Obesitas";
    }

    const kalkulatorBMI = await KalkulatorBMITable.create({
      id_user,
      id_kategori,
      id_jenis_kelamin,
      berat_badan,
      tinggi_badan,
      usia,
      bmi,
    });

    // Ambil kategori dan jenis kelamin terkait
    const kategoriData = await Kategori.findByPk(id_kategori);
    const jenisKelaminData = await JenisKelamin.findByPk(id_jenis_kelamin);

    res.status(201).json({
      message: "Hasil BMI berhasil dihitung",
      data: {
        kalkulatorBMI,
        bmi: bmi.toFixed(1),
        kategori: kategoriData.kategori,
        jenis_kelamin: jenisKelaminData.jenis_kelamin,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Terjadi kesalahan", serverMessage: error.message });
  }
};
