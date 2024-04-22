const mongoose = require("mongoose");
require("./users.schema");
require("./customers.schema");

const notesSchema = new mongoose.Schema({
    title: String,
    content: String,
    user: { type: mongoose.Schema.Types.ObjectId, ref: "Customer" },
    added_by: String,
    is_deleted: Boolean,
}, {
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
});

const Notes = mongoose.model('Notes', notesSchema);
module.exports = { Notes };