import Users from "../models/userTable.js";

export const verifyRole = (role) => {
  return async (req, res, next) => {
    try {
      const user = await Users.findByPk(req.userId);
      if (!user) return res.sendStatus(403);

      // Verifikasi apakah role pengguna ada dalam daftar roles yang diizinkan
      if (!role.includes(user.role_id)) {
        return res.status(403).json({ message: "Forbidden: Anda tidak memiliki akses ke resource ini" });
      }

      next();
    } catch (error) {
      console.log(error);
      res.sendStatus(500); 
    }
  };
};
