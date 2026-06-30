const dotenv = require('dotenv');
dotenv.config();

// ✅ Debug: log the CORS origin being used
console.log('🔗 CORS origin allowed:', process.env.CLIENT_URL);

const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/db');

// Routes
const authRoutes = require('./routes/authRoutes');
const workspaceRoutes = require('./routes/workspaceRoutes');
const projectRoutes = require('./routes/projectRoutes');
const taskRoutes = require('./routes/taskRoutes');
const activityRoutes = require('./routes/activityRoutes');
const messageRoutes = require('./routes/messageRoutes');
const adminRoutes = require('./routes/adminRoutes');
const invitationRoutes = require('./routes/invitationRoutes');
const attachmentRoutes = require('./routes/attachmentRoutes');
const commentRoutes = require('./routes/commentRoutes');
const userRoutes = require('./routes/userRoutes');
const aiRoutes = require('./routes/aiRoutes');
const subtaskRoutes = require('./routes/subtaskRoutes');

const Message = require('./models/Message');

console.log('🔗 MONGO_URI:', process.env.MONGO_URI);
connectDB();

const app = express();
const server = http.createServer(app);

// ---------- CORS (MUST be FIRST) ----------
// ✅ For testing, allow all origins. Once it works, replace with:
// origin: process.env.CLIENT_URL || 'http://localhost:5173'
app.use(cors({
  origin: true, // ✅ allows any origin (temporary for testing)
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

// ---------- Security ----------
app.use(helmet());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: 'Too many requests from this IP, please try again later.',
});
app.use('/api', limiter);

app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Request logger
app.use((req, res, next) => {
  console.log(`📡 ${req.method} ${req.url}`);
  next();
});

// ---------- Socket.io ----------
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});
app.set('io', io);

io.on('connection', (socket) => {
  console.log('✅ New client connected:', socket.id);

  socket.on('join-workspace', (workspaceId) => {
    socket.join(`workspace-${workspaceId}`);
  });

  socket.on('join-project', (projectId) => {
    socket.join(`project-${projectId}`);
  });

  socket.on('join-user', (userId) => {
    socket.join(`user-${userId}`);
    console.log(`Socket ${socket.id} joined user-${userId}`);
  });

  socket.on('send-message', async (data) => {
    const { workspaceId, text, sender, senderName } = data;
    try {
      const message = await Message.create({
        workspace: workspaceId,
        sender,
        senderName,
        text,
      });
      const populated = await Message.findById(message._id).populate('sender', 'name email');
      io.to(`workspace-${workspaceId}`).emit('new-message', populated);
    } catch (error) {
      console.error('Chat error:', error);
      socket.emit('chat-error', { message: 'Failed to send message' });
    }
  });

  socket.on('disconnect', () => {
    console.log('❌ Client disconnected:', socket.id);
  });
});

// ---------- Routes ----------
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/workspaces', workspaceRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/activity', activityRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/invitations', invitationRoutes);
app.use('/api/attachments', attachmentRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/subtasks', subtaskRoutes);

app.get('/', (req, res) => res.send('API is running...'));

app.use((req, res) => {
  res.status(404).json({ message: `Route ${req.originalUrl} not found` });
});

app.use((err, req, res, next) => {
  console.error('❌ Server Error:', err.stack);
  res.status(500).json({
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'production' ? {} : err.message,
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
