import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../../models/userTable.js";

// Controller login
export const loginUser = async (req, res) => {
  try {
    const users = await User.findAll({
      where: {
        email: req.body.email,
      },
    });

    if (!users.length) return res.status(404).json({ msg: "User not found" });

    if (!users[0].isVerified) return res.status(400).json({ msg: "Email belum diverifikasi" });

    const match = await bcrypt.compare(req.body.password, users[0].password);
    if (!match) return res.status(400).json({ msg: "Wrong Password" });

    const { id, name, email, address, role_id, images, jenis_profesi, sertifikat } = users[0];
    const accessToken = jwt.sign({ userId: id, name, email, address, role_id, images, jenis_profesi, sertifikat }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "30s" });
    const refreshToken = jwt.sign({ userId: id, name, email, address, role_id, images, jenis_profesi, sertifikat }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: "1d" });

    await User.update(
      { refreshToken: refreshToken },
      {
        where: {
          id,
        },
      }
    );

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000,
    });
    res.json({ accessToken });
  } catch (error) {
    res.status(404).json({
      message: "Login Failed",
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
