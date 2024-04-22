const mongoose = require('mongoose');
require('./notes.schema');
require('./organizations.schema');

const userSchema = new mongoose.Schema(
  {
    email: String,
    password: String,
    fullname: String,
    phone: String,
    address: String,
    state: String,
    description: String,
    island: String,
    country: String,
    user_type: String,
    organization: { type: mongoose.Schema.Types.ObjectId, ref: 'organizations' },
    doc:String,
    sheet:String,
    notes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'notes' }],
    attachments: Array,
  },
  {
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
);

const User = mongoose.model('User', userSchema);
module.exports = { User };
