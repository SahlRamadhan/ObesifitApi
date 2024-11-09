import Article from "../../models/artikelTable.js";
import Gambar from "../../models/gambarTable.js";
import path from "path";
import fs from "fs";

export const getArticles = async (req, res) => {
  try {
    const articles = await Article.findAll({
      include: [{ model: Gambar, as: "gambar" }],
    });
    res.status(200).json(articles);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch articles", error });
  }
};

// Get Article by Slug
export const getArticleBySlug = async (req, res) => {
  const { slug } = req.params;
  try {
    const article = await Article.findOne({
      where: { slug },
      include: [{ model: Gambar, as: "gambar" }],
    });

    if (!article) return res.status(404).json({ message: "Article not found" });

    res.status(200).json(article);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch article", error });
  }
};

// Create Article with Images
export const createArticle = async (req, res) => {
  const { judul, sub_judul, slug, content } = req.body;
  try {
    const article = await Article.create({ judul, sub_judul, slug, content });

    // Menyimpan gambar jika ada
    if (req.files && req.files.length > 0) {
      const imagesData = req.files.map((file, index) => ({
        article_id: article.id,
        url: file.path,
        deskripsi: req.body.deskripsi ? req.body.deskripsi[index] : null,
        urutan: index + 1,
      }));
      await Gambar.bulkCreate(imagesData);
    }

    res.status(201).json({ message: "Article created successfully", article });
  } catch (error) {
    res.status(500).json({ message: "Failed to create article", error });
  }
};

// Update Article and Replace Images
export const updateArticle = async (req, res) => {
  const { id } = req.params;
  const { judul, sub_judul, slug, content } = req.body;

  try {
    const article = await Article.findByPk(id, { include: [{ model: Gambar, as: "gambar" }] });
    if (!article) return res.status(404).json({ message: "Article not found" });

    // Update article data
    article.judul = judul;
    article.sub_judul = sub_judul;
    article.slug = slug;
    article.content = content;
    await article.save();

    // Jika ada file gambar baru yang diunggah, hapus gambar lama dan simpan gambar baru
    if (req.files && req.files.length > 0) {
      // Hapus gambar lama dari folder
      article.gambar.forEach((gambar) => {
        if (fs.existsSync(gambar.url)) fs.unlinkSync(gambar.url);
      });

      // Hapus data gambar lama dari database
      await Gambar.destroy({ where: { article_id: id } });

      // Simpan gambar baru ke dalam database
      const imagesData = req.files.map((file, index) => ({
        article_id: id,
        url: file.path,
        deskripsi: req.body.deskripsi ? req.body.deskripsi[index] : null,
        urutan: index + 1,
      }));
      await Gambar.bulkCreate(imagesData);
    }

    res.status(200).json({ message: "Article updated successfully", article });
  } catch (error) {
    res.status(500).json({ message: "Failed to update article", error });
  }
};

// Delete Article and Images
export const deleteArticle = async (req, res) => {
  const { id } = req.params;
  try {
    // Mencari artikel beserta gambar yang terkait
    const article = await Article.findByPk(id, { include: [{ model: Gambar, as: "gambar" }] });
    if (!article) return res.status(404).json({ message: "Article not found" });

    // Menghapus gambar dari sistem file
    article.gambar.forEach((gambar) => {
      if (fs.existsSync(gambar.url)) {
        fs.unlinkSync(gambar.url); 
      }
    });

    // Menghapus data gambar dari database
    await Gambar.destroy({ where: { article_id: id } });

    // Menghapus artikel dari database
    await Article.destroy({ where: { id } });

    res.status(200).json({ message: "Article deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete article", error });
  }
};


// Delete All Articles and Images
export const deleteAllArticles = async (req, res) => {
  try {
    // Mengambil semua gambar dari database
    const allGambar = await Gambar.findAll();
    
    // Menghapus gambar dari folder
    allGambar.forEach((gambar) => {
      if (fs.existsSync(gambar.url)) {
        fs.unlinkSync(gambar.url);
      }
    });

    // Menghapus semua data gambar dari database
    await Gambar.destroy({ where: {}, truncate: true });

    // Menghapus semua artikel dari database
    await Article.destroy({ where: {}, truncate: true });

    res.status(200).json({ message: "All articles and images have been deleted" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete all articles and images", error });
  }
};

