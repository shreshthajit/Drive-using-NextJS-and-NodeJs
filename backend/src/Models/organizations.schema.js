const mongoose = require('mongoose');
require('./users.schema');

const organizationSchema = new mongoose.Schema(
  {
    name: String,
    owner: String,
    email: String,
    island: String,
    country: String,
    password: String,
    description: String,
    established: String,
    user_type: String,
  },
  {
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
);

const Organization = mongoose.model('Organization', organizationSchema);
module.exports = { Organization };
