import fs from 'fs';
import { Router } from 'express';
import path from 'path';
import multer from 'multer';
import Blog from '../models/blog.js';
import mongoose from 'mongoose';
import Comment from '../models/comments.js';

const router = Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.resolve(`./public/uploads/${req.user._id}`);

    // ✅ Check if the folder exists, if not, create it
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }

    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const fileName = `${Date.now()}-${file.originalname}`;
    cb(null, fileName);
  },
});

const upload = multer({ storage });



router.get("/addNew", (req, res) => {
  res.render("addBlog", { user: req.user });
});

router.get('/:id', async (req, res, next) => {
  try {
      if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
          return res.status(404).render('404');
      }

      const blog = await Blog.findById(req.params.id)
          .populate('createdBy', 'name email profileImageUrl')
          .populate({
              path: 'comments',
              populate: {
                  path: 'author',
                  select: 'name profileImageUrl'
              },
              options: { sort: { createdAt: -1 } } // Newest comments first
          });

      if (!blog) {
          return res.status(404).render('404');
      }

      return res.render('blog', { 
          blog, 
          user: req.user 
      });
  } catch (err) {
      console.error('Error fetching blog:', err);
      return res.status(500).render('error', {
          error: {
              message: 'Failed to load blog post',
              status: 500
          }
      });
  }
});

// ✅ use `upload.single()` to parse `multipart/form-data`
router.post("/addBlog", upload.single('coverImage'),async (req, res) => {
  const { title, body } = req.body;
    const blog=await Blog.create({
        title,
        body,
        coverImageUrl: `/uploads/${req.user._id}/${req.file.filename}`,
        createdBy: req.user._id,
    }) 
    blog.save()

  // Do something with the data (e.g., save blog to DB)
  res.redirect(`/blog/${blog._id}`);
});

router.post('/:id/comment', async (req, res) => {
  try {
      if (!req.user) {
          return res.status(401).json({ error: 'You must be logged in to comment' });
      }

      const { content } = req.body;
      if (!content || content.trim() === '') {
          return res.status(400).json({ error: 'Comment cannot be empty' });
      }

      const comment = await Comment.create({
          content,
          author: req.user._id,
          blog: req.params.id
      });

      // Add comment to blog's comments array
      await Blog.findByIdAndUpdate(req.params.id, {
          $push: { comments: comment._id }
      });

      // Populate author info before sending back
      const populatedComment = await Comment.findById(comment._id)
          .populate({
            path: 'comments',
            populate: {
                path: 'author',
                select: 'name profileImageUrl'
            }
        })

      return res.json({
          success: true,
          comment: populatedComment
      });
  } catch (err) {
      console.error('Error adding comment:', err);
      return res.status(500).json({ error: 'Failed to add comment' });
  }
});

export default router;
