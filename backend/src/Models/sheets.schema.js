const { object } = require("joi");
const mongoose = require("mongoose");
require("./users.schema");

const sheetsSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      default: function () {
        return `Untitled_${this._id}`;
      },
    },
    data: {
      type: String,
      default: "",
    },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    added_by: {
      type: String,
      default: "",
    },
    is_deleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

const Sheets = mongoose.model("Sheets", sheetsSchema);
module.exports = { Sheets };
