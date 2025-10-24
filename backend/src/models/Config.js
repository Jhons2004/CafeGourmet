











































const mongoose = require('mongoose');
const ConfigSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true, index: true },
  value: { type: mongoose.Schema.Types.Mixed, required: true },
  description: { type: String, default: '' }
}, { timestamps: true });
module.exports = mongoose.model('Config', ConfigSchema);
