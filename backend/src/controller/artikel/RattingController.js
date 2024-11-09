import Ratting from "../../models/rattingTable.js";
import Article from "../../models/artikelTable.js";
import User from "../../models/userTable.js";

// Fungsi untuk menambah rating artikel
export const rateArticle = async (req, res) => {
  const { article_id, user_id, rating } = req.body;

  try {

    // Validasi apakah artikel dan user ada
    const article = await Article.findByPk(article_id);
    if (!article) {
      return res.status(404).json({ message: "Article not found" });
    }

    const user = await User.findByPk(user_id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Cek apakah user sudah memberikan rating untuk artikel ini
    const existingRating = await Ratting.findOne({
      where: {
        article_id: article_id,
        user_id: user_id,
      },
    });

    if (existingRating) {
      return res.status(400).json({ message: "You have already rated this article" });
    }

    // Simpan rating baru
    const newRating = await Ratting.create({
      article_id: article_id,
      user_id: user_id,
      rating: rating,
    });

    return res.status(201).json({
      message: "Rating added successfully",
      data: newRating,
    });
  } catch (error) {
    console.error("Error adding rating:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

// Fungsi untuk mendapatkan rating artikel
export const getArticleRatings = async (req, res) => {
  const { article_id } = req.params;

  try {
    // Cek apakah artikel ada
    const article = await Article.findByPk(article_id);
    if (!article) {
      return res.status(404).json({ message: "Article not found" });
    }

    // Ambil semua rating untuk artikel ini
    const ratings = await Ratting.findAll({
      where: { article_id },
      attributes: ["id", "rating", "created_at", "updated_at"],
      include: [
        {
          model: User,
          as: "users",
          attributes: ["id", "name"],
        },
      ],
    });

    // Hitung jumlah dan rata-rata rating
    const totalRatings = ratings.length;
    const averageRating = totalRatings > 0 ? (ratings.reduce((sum, r) => sum + r.rating, 0) / totalRatings).toFixed(1) : 0;

    return res.status(200).json({
      message: "Ratings fetched successfully",
      data: {
        ratings,
        totalRatings,
        averageRating: parseFloat(averageRating),
      },
    })
  } catch (error) {
    console.error("Error fetching ratings:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Fungsi untuk memperbarui rating
export const updateRating = async (req, res) => {
  const { article_id, rating } = req.body;
  const user_id = req.userId;

  try {
    // Cek apakah artikel yang akan diupdate ada
    const article = await Article.findByPk(article_id);
    if (!article) {
      return res.status(404).json({ message: "Article not found" });
    }

    // Cek apakah user sudah memberikan rating pada artikel ini
    const existingRating = await Ratting.findOne({
      where: { article_id, user_id },
    });
    if (!existingRating) {
      return res.status(404).json({ message: "Rating not found for this article" });
    }

    // Update rating
    existingRating.rating = rating;
    await existingRating.save();

    return res.status(200).json(existingRating);
  } catch (error) {
    console.error("Error updating rating:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Fungsi untuk menghapus rating
export const deleteRating = async (req, res) => {
  const { article_id } = req.params;
  const user_id = req.userId; // Asumsikan user_id sudah ada dalam request (mungkin melalui middleware)

  try {
    // Cek apakah artikel ada
    const article = await Article.findByPk(article_id);
    if (!article) {
      return res.status(404).json({ message: "Article not found" });
    }

    // Cek apakah user sudah memberikan rating pada artikel ini
    const existingRating = await Ratting.findOne({
      where: { article_id, user_id },
    });
    if (!existingRating) {
      return res.status(404).json({ message: "Rating not found for this article" });
    }

    // Hapus rating
    await existingRating.destroy();

    return res.status(200).json({ message: "Rating deleted successfully" });
  } catch (error) {
    console.error("Error deleting rating:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
