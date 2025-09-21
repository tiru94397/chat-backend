const express = require('express')
const http = require('http')
const { Server } = require('socket.io')
const mongoose = require('mongoose')
const cors = require('cors')
const authRoutes = require('./routes/auth')
const messageRoutes = require('./routes/messages')
const { MONGO_URI } = require('./config')

const app = express()
const server = http.createServer(app)
const io = new Server(server, {
  cors: { origin: '*' }
})

app.use(cors())
app.use(express.json())

app.use('/api/auth', authRoutes)
app.use('/api/messages', messageRoutes)

// Socket users map: userId -> socketId
const onlineUsers = new Map()

io.on('connection', socket => {
  console.log('socket connected', socket.id)

  socket.on('user:online', userId => {
    onlineUsers.set(userId, socket.id)
    io.emit('presence:update', Array.from(onlineUsers.keys()))
  })

  socket.on('send:message', async ({ chatId, sender, receiver, content }) => {
    const Message = require('./models/Message')
    try {
      const msg = await Message.create({ chatId, sender, receiver, content })
      // ack to sender
      socket.emit('message:sent', msg)
      // deliver to receiver if online
      const recvSocket = onlineUsers.get(String(receiver))
      if (recvSocket) io.to(recvSocket).emit('message:receive', msg)
    } catch (err) {
      console.error('send message error', err)
      socket.emit('message:error', { error: err.message })
    }
  })

  socket.on('disconnect', () => {
    // remove user from onlineUsers
    for (const [userId, sId] of onlineUsers.entries()) {
      if (sId === socket.id) onlineUsers.delete(userId)
    }
    io.emit('presence:update', Array.from(onlineUsers.keys()))
    console.log('socket disconnected', socket.id)
  })
})

const start = async () => {
  await mongoose.connect(MONGO_URI)
  console.log('Mongo connected')
  const port = process.env.PORT || 4000
  server.listen(port, () => console.log('Server running on', port))
}

start().catch(err => console.error(err))
