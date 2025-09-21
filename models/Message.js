const mongoose = require('mongoose')

const MessageSchema = new mongoose.Schema({
  chatId: { type: String, required: true },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  receiver: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String },
  attachments: [String],
  delivered: { type: Boolean, default: false },
  seen: { type: Boolean, default: false }
}, { timestamps: true })

module.exports = mongoose.model('Message', MessageSchema)
