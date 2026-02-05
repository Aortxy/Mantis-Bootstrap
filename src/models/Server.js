const mongoose = require('mongoose');

const ServerSchema = new mongoose.Schema({
  serverId: { type: String, required: true, unique: true }, // Pterodactyl ID
  name: { type: String, required: true },
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Reseller who created it
  directBuyerEmail: { type: String }, // Email of direct buyer if not created by reseller
  memory: { type: Number },
  status: { type: String, default: 'active' },
  panelUrl: { type: String },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Server', ServerSchema);
