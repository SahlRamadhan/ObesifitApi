import Users from "../../models/userTable.js";
import jwt from "jsonwebtoken";

export const refreshToken = async (req, res) => {
  try {
    // Ambil refresh token dari cookie
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      return res.status(401).json({ message: "Refresh token tidak ditemukan" });
    }

    // Cari user berdasarkan refresh token
    const user = await Users.findOne({
      where: { refreshToken },
    });

    if (!user) {
      return res.status(403).json({ message: "Refresh token tidak valid" });
    }

    // Verifikasi refresh token
    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, decoded) => {
      if (err) {
        return res.status(403).json({ message: "Refresh token sudah kedaluwarsa" });
      }

      // Buat access token baru
      const accessToken = jwt.sign({ userId: user.id, name: user.name, email: user.email, role_id: user.role_id, images: user.images, telepon: user.telepon, }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "15m" });

      // Kembalikan access token ke client
      res.json({
        accessToken,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role_id: user.role_id,
          images: user.images, 
          telepon: user.telepon,
        },
      });
    });
  } catch (error) {
    console.error("Error di refreshToken:", error);
    res.status(500).json({ message: "Terjadi kesalahan di server" });
  }
};
export default refreshToken;
