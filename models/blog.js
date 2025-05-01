// models/Blog.js
import {Schema, model} from "mongoose";

const blogSchema = new Schema({
    title: {
        type: String,
        required: true,
    },
    body: {
        type: String,
        required: true,
    },
    coverImageUrl: {
        type: String,
        required: true,
    },
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: 'User', 
        required: true,
    }, 
}, {timestamps: true});

const Blog = model("Blog", blogSchema); // Changed to uppercase "Blog" for consistency

export default Blog;