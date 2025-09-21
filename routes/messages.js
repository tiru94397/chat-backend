const express = require('express')
const router = express.Router()
const Message = require('../models/Message')

// fetch conversation by chatId
router.get('/:chatId', async (req, res) => {
  const { chatId } = req.params
  try {
    const msgs = await Message.find({ chatId }).sort({ createdAt: 1 })
    res.json(msgs)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

module.exports = router
