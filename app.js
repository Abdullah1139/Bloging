import express from 'express';
import path from 'path';
import userRoute from './routes/user.js';
import blogRoute from './routes/blog.js';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import { populateUser } from './middlewares/authentication.js';

import Blog from './models/blog.js';
dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.set('view engine', 'ejs');
app.set('views', path.resolve('./views'));
app.use(express.static(path.resolve('./public')));


app.use(cookieParser());
app.use(populateUser('token')); // ✅ This sets req.user & res.locals.user if authenticated

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// In your main server file
// In your route file
app.get('/', async(req, res) => {
    try {
        const allBlogs = await Blog.find({})
            .populate('createdBy', 'name email')
            .sort({ createdAt: -1 });
        
        // Debug: Check the first blog's createdBy field
        console.log('First blog createdBy:', allBlogs[0]?.createdBy);
        
        res.render('home', {
            blogs: allBlogs,
            user: req.user
        });
    } catch (err) {
        console.error('Error fetching blogs:', err);
        res.render('home', {
            blogs: [],
            user: req.user
        });
    }
});
app.use('/user', userRoute);
app.use('/blog', blogRoute)

// Add this after all your routes
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).render('error', {
        error: {
            message: err.message || 'Something went wrong!',
            status: 500
        }
    });
});

// 404 handler (should be last route)
app.use((req, res) => {
    res.status(404).render('404');
});

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB Error:', err));

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
