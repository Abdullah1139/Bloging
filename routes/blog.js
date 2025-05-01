import fs from 'fs';
import { Router } from 'express';
import path from 'path';
import multer from 'multer';
import Blog from '../models/blog.js';

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

export default router;
