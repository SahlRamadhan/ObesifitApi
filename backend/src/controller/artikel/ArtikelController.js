import dotenv from "dotenv";
import Article from "../../models/artikelTable.js";
import ArticleFile from "../../models/artikelFileTable.js";
import fs from "fs";

dotenv.config();
const BASE_URL = process.env.BASE_URL || "http://localhost:4000/public/";

const deleteOldFile = (filePath) => {
  const fullPath = `./public/${filePath}`; // Tambahkan path lengkap ke direktori public
  if (fs.existsSync(fullPath)) {
    fs.unlinkSync(fullPath);
  }
};


// Create Article
export const createArticle = async (req, res) => {
  try {
    const { judul, sub_judul, content } = req.body;

    const images = req.files.images ? `images/articles/${req.files.images[0].filename}` : null;
    const thumbnail = req.files.thumbnail ? `thumbnails/articles/${req.files.thumbnail[0].filename}` : null;

    const articleData = await Article.create({ judul, sub_judul, content });

    const articleFile = await ArticleFile.create({
      article_id: articleData.id,
      images,
      thumbnail,
    });

    res.status(201).json({
      message: "Article created successfully",
      articleData,
      articleFile: {
        ...articleFile.dataValues,
        images: images ? `${BASE_URL}${images}` : null,
        thumbnail: thumbnail ? `${BASE_URL}${thumbnail}` : null,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to create article", error });
  }
};

// Get All Articles
export const getAllArticles = async (req, res) => {
  try {
    const articles = await Article.findAll({
      include: [
        {
          model: ArticleFile,
          as: "articles_files",
          attributes: ["id", "images", "thumbnail"],
        },
      ],
    });

    const updatedArticles = articles.map((article) => {
      const updatedFiles = article.articles_files.map((file) => ({
        ...file.dataValues,
        images: file.images ? `${BASE_URL}${file.images}` : null,
        thumbnail: file.thumbnail ? `${BASE_URL}${file.thumbnail}` : null,
      }));
      return { ...article.dataValues, articles_files: updatedFiles };
    });

    res.status(200).json(updatedArticles);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch articles", error });
  }
};

// Get Article by ID
export const getArticleById = async (req, res) => {
  try {
    const { id } = req.params;
    const article = await Article.findOne({
      where: { id },
      include: [
        {
          model: ArticleFile,
          as: "articles_files",
          attributes: ["id", "images", "thumbnail"],
        },
      ],
    });

    if (!article) {
      return res.status(404).json({ message: "Article not found" });
    }

    const updatedFiles = article.articles_files.map((file) => ({
      ...file.dataValues,
      images: file.images ? `${BASE_URL}${file.images}` : null,
      thumbnail: file.thumbnail ? `${BASE_URL}${file.thumbnail}` : null,
    }));

    res.status(200).json({ ...article.dataValues, articles_files: updatedFiles });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch article", error });
  }
};

// Update Article
export const updateArticle = async (req, res) => {
  try {
    const { id } = req.params;
    const { judul, sub_judul, content } = req.body;

    // Cari artikel berdasarkan ID
    const article = await Article.findByPk(id);
    if (!article) return res.status(404).json({ message: "Article not found" });

    // Update judul, sub_judul, dan content jika ada
    article.judul = judul || article.judul;
    article.sub_judul = sub_judul || article.sub_judul;
    article.content = content || article.content;
    await article.save();

    // Update file gambar jika ada
    if (req.files) {
      const articleFile = await ArticleFile.findOne({ where: { article_id: id } });
      if (!articleFile) return res.status(404).json({ message: "Article file not found" });

      // Update images
      if (req.files.images) {
        deleteOldFile(articleFile.images); // Hapus file lama
        articleFile.images = `images/articles/${req.files.images[0].filename}`;
      }

      // Update thumbnail
      if (req.files.thumbnail) {
        deleteOldFile(articleFile.thumbnail); // Hapus file lama
        articleFile.thumbnail = `thumbnails/articles/${req.files.thumbnail[0].filename}`;
      }

      await articleFile.save();
    }

    // Ambil data terbaru setelah update
    const updatedArticle = await Article.findOne({
      where: { id },
      include: [
        {
          model: ArticleFile,
          as: "articles_files",
          attributes: ["id", "images", "thumbnail"],
        },
      ],
    });

    // Kembalikan data terbaru
    res.status(200).json({
      message: "Article updated successfully",
      article: {
        ...updatedArticle.dataValues,
        articles_files: updatedArticle.articles_files.map((file) => ({
          ...file.dataValues,
          images: file.images ? `${BASE_URL}${file.images}` : null,
          thumbnail: file.thumbnail ? `${BASE_URL}${file.thumbnail}` : null,
        })),
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to update article", error });
  }
};


// Delete Article
export const deleteArticle = async (req, res) => {
  try {
    const { id } = req.params;
    const article = await Article.findByPk(id);
    if (!article) return res.status(404).json({ message: "Article not found" });

    const articleFile = await ArticleFile.findOne({ where: { article_id: id } });
    if (articleFile) {
      deleteOldFile(articleFile.images);
      deleteOldFile(articleFile.thumbnail);
      await articleFile.destroy();
    }

    await article.destroy();
    res.status(200).json({ message: "Article deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete article", error });
  }
};
