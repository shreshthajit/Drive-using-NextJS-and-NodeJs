const mongoose = require("mongoose");
require("./users.schema");
require("./customers.schema");

const ticketsSchema = new mongoose.Schema({
    reason: String,
    raised_by: String,
    associated_to: { type: mongoose.Schema.Types.ObjectId, ref: "Customer" },
    organization: String,
    description: String,
    status: String,
    is_deleted: Boolean,
}, {
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
});

const Tickets = mongoose.model('Tickets', ticketsSchema);
module.exports = { Tickets };