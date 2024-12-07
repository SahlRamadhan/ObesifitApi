import jwt from "jsonwebtoken";


export const verifyToken = (req, res, next) => {
  // Ambil token dari header Authorization
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    console.log("Token tidak ditemukan di header Authorization.");
    return res.status(401).json({ message: "Unauthorized: Token tidak ditemukan." });
  }

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      console.log("Token tidak valid atau sudah kedaluwarsa:", err.message);
      return res.status(403).json({ message: "Token tidak valid atau sudah kedaluwarsa." });
    }

    req.userId = decoded.userId;
    req.role_id = decoded.role_id;
    console.log("Token valid untuk user:", decoded);
    next();
  });
};

