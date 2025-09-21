const express = require('express')
const router = express.Router()
const User = require('../models/User')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const { JWT_SECRET } = require('../config')

router.post('/register', async (req, res) => {
  const { username, password } = req.body
  try {
    const existing = await User.findOne({ username })
    if (existing) return res.status(400).json({ error: 'Username taken' })
    const passwordHash = await bcrypt.hash(password, 10)
    const user = await User.create({ username, passwordHash })
    const token = jwt.sign({ id: user._id }, JWT_SECRET)
    res.json({ user: { id: user._id, username: user.username }, token })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.post('/login', async (req, res) => {
  const { username, password } = req.body
  try {
    const user = await User.findOne({ username })
    if (!user) return res.status(400).json({ error: 'Invalid credentials' })
    const ok = await bcrypt.compare(password, user.passwordHash)
    if (!ok) return res.status(400).json({ error: 'Invalid credentials' })
    const token = jwt.sign({ id: user._id }, JWT_SECRET)
    res.json({ user: { id: user._id, username: user.username }, token })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// helper: list users (no passwordHash)
router.get('/users', async (req, res) => {
  const users = await User.find({}, 'username')
  res.json(users)
})

module.exports = router
