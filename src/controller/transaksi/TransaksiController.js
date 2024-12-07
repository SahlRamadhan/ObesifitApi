import Berlangganan from "../../models/berlanggananTable.js";
import User from "../../models/userTable.js";
import Status from "../../models/statusTable.js";
import { SendPaymentEmail, generatePaymentCode } from "../../services/codeEmailServices.js";
import { sendApprovalEmail, sendTolakEmail } from "../../services/emailBerlangganan.js";
import dotenv from "dotenv";
import { Op } from "sequelize";
dotenv.config();
const BASE_URL = process.env.BASE_URL || "http://localhost:4000/public/";

const STATUS = {
  PENDING: 1,
  APPROVED: 2,
  REJECTED: 3,
  EXPIRED: 4,
};

// Durasi langganan dalam hari
const SUBSCRIPTION_DURATION = 30;

// Mengambil semua transaksi
export const getAllTransaksi = async (req, res) => {
  try {
    const transaksi = await Berlangganan.findAll({
      include: [
        {
          model: Status,
          as: "status",
          attributes: ["id", "status"], // Pastikan ini sesuai dengan kolom di model Status
        },
        {
          model: User,
          as: "user",
          attributes: ["id", "name", "email", "images"], // Pastikan ini sesuai dengan kolom di model User
        },
      ],
      order: [["created_At", "DESC"]], // Tambahkan jika ingin hasil berdasarkan waktu terbaru
    });
    res.status(200).json(transaksi);
  } catch (error) {
    res.status(500).json({ message: "Terjadi kesalahan", serverMessage: error.message });
  }
};

// Endpoint untuk memeriksa langganan aktif
export const getActiveSubscription = async (req, res) => {
  try {
    const { id_user } = req.params; // ID user dari parameter

    const transaksi = await Berlangganan.findOne({
      where: {
        id_user,
        id_status: STATUS.APPROVED,
        end_date: { [Op.gt]: new Date() }, // end_date > sekarang
      },
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "name", "email", "images"],
        },
      ],
    });

    if (!transaksi) {
      return res.status(404).json({ message: "Tidak ada langganan aktif." });
    }

    res.status(200).json({
      message: "Langganan aktif ditemukan.",
      transaksi,
    });
  } catch (error) {
    console.error("Error checking active subscription:", error.message);
    res.status(500).json({ message: "Terjadi kesalahan", serverMessage: error.message });
  }
};

// Membuat transaksi baru
export const createTransaksi = async (req, res) => {
  try {
    const { email, id_user } = req.body; // Ambil ID user dari token
    const jumlahPembayaran = 49000; // Harga tetap
    const codePembayaran = generatePaymentCode(); // Generate kode pembayaran

    // Ambil data pengguna
    const user = await User.findByPk(id_user, { attributes: ["name", "email"] });
    if (!user) {
      return res.status(404).json({ message: "Pengguna tidak ditemukan." });
    }

    const { name } = user;

    // Buat transaksi awal dengan status pending
    const transaksi = await Berlangganan.create({
      id_user,
      id_status: STATUS.PENDING, // Pending
      code_pembayaran: codePembayaran,
      jumlah_pembayaran: jumlahPembayaran,
      transaksi_date: new Date(),
    });

    // Kirim kode pembayaran ke email user
    await SendPaymentEmail(email, codePembayaran, jumlahPembayaran, name);

    res.status(200).json({
      message: "Kode pembayaran telah dikirim ke email Anda.",
      transaksi,
    });
  } catch (error) {
    res.status(500).json({ message: "Terjadi kesalahan", serverMessage: error.message });
  }
};

// Mengunggah bukti pembayaran
export const uploadPaymentProof = async (req, res) => {
  try {
    const { code_pembayaran } = req.body;

    // Validasi file bukti pembayaran
    if (!req.file) {
      return res.status(400).json({ message: "Bukti pembayaran harus diunggah." });
    }

    const buktiPembayaran = `${BASE_URL}/bukti/${req.file.filename}`;

    // Cari transaksi berdasarkan kode pembayaran
    const transaksi = await Berlangganan.findOne({ where: { code_pembayaran } });

    if (!transaksi) {
      return res.status(404).json({ message: "Kode pembayaran tidak valid." });
    }

    // Update transaksi dengan bukti pembayaran
    transaksi.bukti_pembayaran = buktiPembayaran;
    transaksi.id_status = STATUS.PENDING; // Tetap pending
    await transaksi.save();

    res.status(200).json({
      message: "Bukti pembayaran berhasil diunggah, menunggu persetujuan admin.",
      transaksi,
    });
  } catch (error) {
    res.status(500).json({ message: "Terjadi kesalahan", serverMessage: error.message });
  }
};


// Memverifikasi langganan oleh admin
export const verifySubscription = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // Ambil status dari body

    // Validasi status
    if (![STATUS.APPROVED, STATUS.REJECTED].includes(status)) {
      return res.status(400).json({ message: "Status tidak valid." });
    }

    // Cari transaksi berdasarkan ID
    const transaksi = await Berlangganan.findByPk(id, {
      include: {
        model: User,
        as: "user",
        attributes: ["name", "email"],
      },
    });

    if (!transaksi) {
      return res.status(404).json({ message: "Transaksi tidak ditemukan." });
    }

    const { email, name } = transaksi.user;

    if (status === STATUS.APPROVED) {
      // Jika disetujui
      transaksi.id_status = STATUS.APPROVED; // Status 2
      transaksi.start_date = new Date();
      transaksi.end_date = new Date(new Date().setDate(new Date().getDate() + SUBSCRIPTION_DURATION));

      // Kirim email berlangganan diterima
      await sendApprovalEmail(email, name);
    } else if (status === STATUS.REJECTED) {
      // Jika ditolak
      transaksi.id_status = STATUS.REJECTED; // Status 3

      // Kirim email berlangganan ditolak
      await sendTolakEmail(email, name);
    }

    await transaksi.save();

    res.status(200).json({
      message: status === STATUS.APPROVED ? "Pembayaran disetujui." : "Pembayaran ditolak.",
      transaksi,
    });
  } catch (error) {
    res.status(500).json({ message: "Terjadi kesalahan", serverMessage: error.message });
  }
};


// Mengecek langganan yang kadaluwarsa
export const checkExpiredSubscription = async (req, res) => {
  try {
    const { id } = req.params;

    // Cari transaksi berdasarkan ID
    const transaksi = await Berlangganan.findByPk(id, {
      include: {
        model: Status,
        as: "status",
      },
    });

    if (!transaksi) {
      return res.status(404).json({ message: "Transaksi tidak ditemukan." });
    }

    if (transaksi.id_status === STATUS.APPROVED && new Date() > transaksi.end_date) {
      // Jika transaksi disetujui dan sudah expired
      transaksi.id_status = STATUS.EXPIRED; // Expired
      await transaksi.save();

      return res.status(200).json({ message: "Langganan Anda telah berakhir." });
    }

    res.status(200).json({ message: "Langganan Anda masih aktif." });
  } catch (error) {
    res.status(500).json({ message: "Terjadi kesalahan", serverMessage: error.message });
  }
};
