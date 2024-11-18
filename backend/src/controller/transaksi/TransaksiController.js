import Berlangganan from "../../models/berlanggananTable.js";
import Status from "../../models/statusTable.js";
import { SendPaymentEmail, generatePaymentCode } from "../../services/codeEmailServices.js";

export const createTransaksi = async (req, res) => {
  try {
    const { email } = req.body;
    const id_user = req.userId; // Ambil ID user dari token
    const jumlahPembayaran = 49000; // Harga tetap
    const codePembayaran = generatePaymentCode(); // Generate kode pembayaran

    // Buat transaksi awal dengan status pending
    const transaksi = await Berlangganan.create({
      id_user,
      id_status: 1, // Pending
      code_pembayaran: codePembayaran,
      jumlah_pembayaran: jumlahPembayaran,
      transaksi_date: new Date(),
    });

    // Kirim kode pembayaran ke email user
    await SendPaymentEmail(email, codePembayaran, jumlahPembayaran);

    res.status(200).json({
      message: "Kode pembayaran telah dikirim ke email Anda.",
      transaksi,
    });
  } catch (error) {
    res.status(500).json({ message: "Terjadi kesalahan", serverMessage: error.message });
  }
};

export const uploadPaymentProof = async (req, res) => {
  try {
    const { code_pembayaran } = req.body;

    // Validasi file bukti pembayaran
    if (!req.file) {
      return res.status(400).json({ message: "Bukti pembayaran harus diunggah." });
    }

    const buktiPembayaran = req.file.path; // Path file bukti pembayaran

    // Cari transaksi berdasarkan kode pembayaran
    const transaksi = await Berlangganan.findOne({ where: { code_pembayaran } });

    if (!transaksi) {
      return res.status(404).json({ message: "Kode pembayaran tidak valid." });
    }

    // Update transaksi dengan bukti pembayaran
    transaksi.bukti_pembayaran = buktiPembayaran;
    transaksi.id_status = 1; // Tetap pending
    await transaksi.save();

    res.status(200).json({
      message: "Bukti pembayaran berhasil diunggah, menunggu persetujuan admin.",
      transaksi,
    });
  } catch (error) {
    res.status(500).json({ message: "Terjadi kesalahan", serverMessage: error.message });
  }
};

export const verifySubscription = async (req, res) => {
  try {
    const { id } = req.params;
    const { isApproved } = req.body;

    // Cari transaksi berdasarkan ID
    const transaksi = await Berlangganan.findByPk(id);

    if (!transaksi) {
      return res.status(404).json({ message: "Transaksi tidak ditemukan." });
    }

    if (isApproved) {
      // Jika disetujui
      transaksi.id_status = 2; // Approved
      transaksi.start_date = new Date();
      transaksi.end_date = new Date(
        new Date().setDate(new Date().getDate() + 30) // Langganan aktif 30 hari
      );
    } else {
      // Jika ditolak
      transaksi.id_status = 3; // Rejected
    }

    await transaksi.save();

    res.status(200).json({
      message: isApproved ? "Pembayaran disetujui." : "Pembayaran ditolak.",
      transaksi,
    });
  } catch (error) {
    res.status(500).json({ message: "Terjadi kesalahan", serverMessage: error.message });
  }
};

export const checkExpiredSubscription = async (req, res) => {
  try {
    const { id } = req.params;

    // Cari transaksi berdasarkan ID
    const transaksi = await Berlangganan.findByPk(id, {
      include: {
        model: Status,
        as: "status",}});

    if (!transaksi) {
      return res.status(404).json({ message: "Transaksi tidak ditemukan." });
    }

    if (transaksi.id_status === 2 && new Date() > transaksi.end_date) {
      // Jika transaksi disetujui dan sudah expired
      transaksi.id_status = 4; // Expired
      await transaksi.save();

      return res.status(200).json({ message: "Langganan Anda telah berakhir." });
    }

    res.status(200).json({ message: "Langganan Anda masih aktif." });
  } catch (error) {
    res.status(500).json({ message: "Terjadi kesalahan", serverMessage: error.message });
  }
};
