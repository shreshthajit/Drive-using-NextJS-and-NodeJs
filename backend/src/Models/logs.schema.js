const mongoose = require('mongoose');
require('./contacts.schema');

const logsSchema = new mongoose.Schema(
  {
    reason: String,
    visit_by: String,
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'Contacts' },
    is_deleted: Boolean,
    added_by: String,
  },
  {
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
);

const Logs = mongoose.model('Logs', logsSchema);
module.exports = { Logs };
