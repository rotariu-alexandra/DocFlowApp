import mongoose, { Schema, model, models } from "mongoose";

const CommentSchema = new Schema(
    {
        requestId: { type: String, required: true, index: true },
        authorId: { type: String, required: true },
        authorName: { type: String, required: true },
        authorRole: { type: String, required: true },
        content: { type: String, required: true, maxlength: 2000 },
    },
    { timestamps: true }
);

const Comment = models.Comment || model("Comment", CommentSchema);
export default Comment;