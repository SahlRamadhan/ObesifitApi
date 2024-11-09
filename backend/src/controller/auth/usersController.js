// usersController.js
import path from "path";
import userModels from "../../models/userTable.js";
import roleModels from "../../models/roleTable.js";
import { SendOtpEmail, generateOtp } from "../../services/emailServices.js";
import bcrypt from "bcrypt";
import fs from "fs";

// Controller get
export const getAllUsers = async (req, res) => {
  try {
    const users = await userModels.findAll({
      include: [
        {
          model: roleModels,
          as: "role",
        },
      ],
    });
    res.status(200).json({
      status: 200,
      message: "Get Data Success",
      data: users,
    });
  } catch (error) {
    res.status(500).json({
      message: "Get Data Failed",
      serverMessage: error.message,
    });
  }
};

// Controller get by id
export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await userModels.findByPk(id, {
      include: [
        {
          model: roleModels,
          as: "role",
        },
      ],
    });
    res.status(200).json({
      status: 200,
      message: "Get Data Success",
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      message: "Get Data Failed",
      serverMessage: error.message,
    });
  }
};

// Controller post
export const createUser = async (req, res) => {
  const { name, email, address, telepon, password, confirmPassword, jenis_profesi } = req.body;

  // Cek role_id berdasarkan rute
  const isDoctor = req.originalUrl.includes("dokter");
  const isUserOrAdmin = req.originalUrl.includes("user");

  let role_id;
  if (isDoctor) {
    role_id = 3;
  } else if (isUserOrAdmin) {
    role_id = 2;
  } else {
    return res.status(400).json({
      status: 400,
      message: "Endpoint tidak valid untuk pendaftaran ini.",
    });
  }

  const role = await roleModels.findOne({ where: { id: role_id } });
  if (!role) {
    return res.status(400).json({
      status: 400,
      message: "Role tidak ditemukan",
    });
  }

  // Cek apakah password sesuai dengan confirmPassword
  if (password !== confirmPassword) {
    return res.status(400).json({
      status: 400,
      message: "Password dan Konfirmasi Password tidak sama",
    });
  }

  try {
    // Hash password
    const hashPassword = await bcrypt.hash(password, 10);

    let images = null;
    let sertifikat = null;

    if (isDoctor) {
      // Jika dokter, periksa apakah sertifikat diunggah
      sertifikat = req.files && req.files.sertifikat ? path.basename(req.files.sertifikat[0].path) : null;

      // Jika sertifikat tidak ada
      if (!sertifikat) {
        return res.status(400).json({
          status: 400,
          message: "Sertifikat wajib diunggah untuk role dokter",
        });
      }
    }

    const { otp, otpExpires } = generateOtp();

    // Buat data user baru
    const newUser = await userModels.create({
      name,
      email,
      address,
      telepon,
      role_id,
      password: hashPassword,
      images,
      jenis_profesi: isDoctor ? jenis_profesi : null,
      sertifikat: isDoctor ? sertifikat : null,
      otp,
      otpExpires,
      isVerified: false,
    });

    await SendOtpEmail(email, otp);

    res.status(201).json({
      status: 201,
      message: "Data berhasil dibuat",
      data: newUser,
    });
  } catch (error) {
    res.status(500).json({
      message: "Gagal membuat data",
      serverMessage: error.message,
    });
  }
};

// Controller update
export const updateUser = async (req, res) => {
  try {
    const user = await userModels.findOne({ where: { id: req.params.id } });
    if (!user) {
      return res.status(404).json({ status: 404, message: "User tidak ditemukan" });
    }

    // Hash password hanya jika ada permintaan perubahan password
    const hashPassword = await getHashedPassword(req.body.password, user.password);
    if (hashPassword.error) {
      return res.status(400).json(hashPassword.error);
    }

    if (req.body.password && req.body.password !== req.body.confirmPassword) {
      return res.status(400).json({
        status: 400,
        message: "Password dan Konfirmasi Password Tidak Sama",
      });
    }

    // Siapkan data yang akan diperbarui
    const updatedData = {
      name: req.body.name || user.name,
      email: req.body.email || user.email,
      address: req.body.address || user.address,
      telepon: req.body.telepon || user.telepon,
      password: hashPassword.newPassword || user.password,
      images: req.files && req.files.images ? path.basename(req.files.images[0].path) : user.images, // Pastikan ini benar
    };

    if (user.role_id === 3) {
      updatedData.jenis_profesi = req.body.jenis_profesi || user.jenis_profesi;

      if (req.files && req.files.sertifikat) {
        updatedData.sertifikat = path.basename(req.files.sertifikat[0].path);
      }
    }

    // Update data user
    await userModels.update(updatedData, { where: { id: req.params.id } });

    res.status(200).json({
      status: 200,
      message: "Update Data Success",
    });
  } catch (error) {
    res.status(500).json({
      message: "Update Data Failed",
      serverMessage: error.message,
    });
  }
};

const deleteFile = (filePath) => {
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
};
// Controller delete
export const deleteUser = async (req, res) => {
  try {
    const user = await userModels.findOne({ where: { id: req.params.id } });
    if (!user) {
      return res.status(404).json({
        status: 404,
        message: "User tidak ditemukan",
      });
    }

    // Hapus file gambar jika ada
    if (user.images) {
      const imagePath = path.join("public/images", user.images);
      deleteFile(imagePath);
    }
    if (user.sertifikat) {
      const sertifikatPath = path.join("public/sertifikat", user.sertifikat);
      deleteFile(sertifikatPath);
    }

    // Hapus data user dari database
    await userModels.destroy({ where: { id: user.id } });
    res.status(200).json({
      status: 200,
      message: "Delete Data Success",
    });
  } catch (error) {
    console.error("Delete User Error:", error); // Log any error
    res.status(500).json({
      message: "Delete Data Failed",
      serverMessage: error.message,
    });
  }
};

// Controller delete all
export const deleteAllUsers = async (req, res) => {
  try {
    const users = await userModels.findAll();
    console.log("Users to delete:", users.length);

    users.forEach((user) => {
      if (user.images) {
        const imagePath = path.join("public/images", user.images);
        deleteFile(imagePath);
      }
      if (user.sertifikat) {
        const sertifikatPath = path.join("public/sertifikat", user.sertifikat);
        deleteFile(sertifikatPath);
      }
    });

    // Hapus semua data user dari database
    await userModels.destroy({ where: {}, truncate: true });
    res.status(200).json({
      status: 200,
      message: "Delete All Data Success",
    });
  } catch (error) {
    console.error("Delete All Users Error:", error); // Log any error
    res.status(500).json({
      message: "Delete All Data Failed",
      serverMessage: error.message,
    });
  }
};

const getHashedPassword = async (newPassword, currentPassword) => {
  if (!newPassword) return currentPassword; // Return current password if no new password provided
  return await bcrypt.hash(newPassword, 10); // Hash the new password
};

const deletePreviousFile = (directory, fileName) => {
  const filePath = path.join(directory, fileName);
  if (fs.existsSync(filePath)) fs.unlinkSync(filePath); // Delete file if it exists
};
