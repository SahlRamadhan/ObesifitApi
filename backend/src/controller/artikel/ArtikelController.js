import Article from "../../models/artikelTable.js";
import ArticleFile from "../../models/artikelFileTable.js";
import fs from "fs";
import { Sequelize } from "sequelize";

// Create Article with Images
export const createArticle = async (req, res) => {
  try {
    const { judul, sub_judul, content } = req.body;

    const images = req.files.images ? req.files.images[0].path : null;
    const thumbnail = req.files.thumbnail ? req.files.thumbnail[0].path : null;

    const articleData = await Article.create({
      judul,
      sub_judul,
      content,
    });

    const articleFile = await ArticleFile.create({
      article_id: articleData.id,
      images,
      thumbnail,
    });

    res.status(201).json({ message: "Article created successfully", articleData, articleFile });
  } catch (error) {
    res.status(500).json({ message: "Failed to create article", error });
  }
};

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
    res.status(200).json(articles);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch articles", error });
  }
};

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

    res.status(200).json(article);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch article", error });
  }
};

export const updateArticle = async (req, res) => {
  try {
    const { id } = req.params;
    const { judul, sub_judul, content } = req.body;

    const article = await Article.findByPk(id);
    if (!article) {
      return res.status(404).json({ message: "Article not found" });
    }

    article.judul = judul || article.judul;
    article.sub_judul = sub_judul || article.sub_judul;
    article.content = content || article.content;

    await article.save();

    if (req.files) {
      const articleFile = await ArticleFile.findOne({ where: { article_id: id } });

      if (!articleFile) {
        return res.status(404).json({ message: "Article file not found" });
      }

      if (req.files.images) {
        fs.unlinkSync(articleFile.images); // Delete old images
        articleFile.images = req.files.images[0].path;
      }

      if (req.files.thumbnail) {
        fs.unlinkSync(articleFile.thumbnail); // Delete old thumbnail
        articleFile.thumbnail = req.files.thumbnail[0].path;
      }

      await articleFile.save();
    }

    res.status(200).json({ message: "Article updated successfully", article });
  } catch (error) {
    res.status(500).json({ message: "Failed to update article", error });
  }
};

export const deleteArticle = async (req, res) => {
  try {
    const { id } = req.params;
    const article = await Article.findByPk(id);
    if (!article) {
      return res.status(404).json({ message: "Article not found" });
    }

    const articleFile = await ArticleFile.findOne({ where: { article_id: id } });
    if (articleFile) {
      // Delete associated files
      fs.unlinkSync(articleFile.images);
      fs.unlinkSync(articleFile.thumbnail);
      await articleFile.destroy();
    }

    await article.destroy();

    res.status(200).json({ message: "Article deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete article", error });
  }
};


