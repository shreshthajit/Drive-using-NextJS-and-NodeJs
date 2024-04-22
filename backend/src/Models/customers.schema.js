const mongoose = require('mongoose');
require('./notes.schema');
require('./users.schema');

const customerSchema = new mongoose.Schema(
  {
    fullname: String,
    address: String,
    state: String,
    email: String,
    phone: String,
    island: String,
    country: String,
    customer_id: String,
    organization: String,
    is_active: Boolean,
    added_by: String,
    attachments: Array,
  },
  {
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
);

const Customer = mongoose.model('Customer', customerSchema);
module.exports = { Customer };
