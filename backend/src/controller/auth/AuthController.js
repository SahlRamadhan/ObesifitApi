import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../../models/userTable.js";

// Controller login
export const loginUser = async (req, res) => {
  try {
    const { email, password, expectedRole } = req.body; // Tambahkan expectedRole dari request body

    const users = await User.findAll({
      where: { email },
    });

    if (!users.length) return res.status(404).json({ msg: "User tidak ditemukan" });

    const user = users[0];

    if (!user.isVerified) return res.status(400).json({ msg: "Email belum diverifikasi" });

    if (user.role_id === 3 && !user.isVerifiedByAdmin) {
      return res.status(400).json({ msg: "Dokter belum diverifikasi oleh admin" });
    }

    // Validasi role
    if (user.role_id !== expectedRole) {
      return res.status(403).json({ msg: "Role Anda tidak diizinkan untuk login di sini." });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ msg: "Password salah" });

    // Buat token hanya jika role valid
    const { id, name, images, role_id, telepon } = user;
    const accessToken = jwt.sign({ userId: id, name, email, role_id, images, telepon }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "15m" });
    const refreshToken = jwt.sign({ userId: id, name, email, role_id, images, telepon }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: "1d" });

    await User.update({ refreshToken }, { where: { id } });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000,
      sameSite: "None",
      secure: true,
    });

    res.json({
      accessToken,
      user: {
        name,
        images,
        role_id,
        email,
        telepon,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Terjadi kesalahan saat login",
      serverMessage: error.message,
    });
  }
};

// Controller logout
export const logoutUser = async (req, res) => {
  const { refreshToken } = req.cookies;

  if (!refreshToken) return res.sendStatus(204); // No content

  const user = await User.findAll({ where: { refreshToken } });

  if (!user[0]) return res.status(204).json({ message: "User not found" }); // No content

  await User.update({ refreshToken: null }, { where: { id: user[0].id } });

  res.clearCookie("refreshToken");
  return res.status(200).json({ message: "Logout Success" });
};
