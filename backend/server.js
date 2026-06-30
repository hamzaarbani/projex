const dotenv = require('dotenv');
dotenv.config();

console.log('🔗 CORS origin allowed:', process.env.CLIENT_URL || 'http://localhost:5173');

const express = require('express');
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

// ---------- MANUAL CORS HEADERS (BEFORE all middleware) ----------
app.use((req, res, next) => {
  // Allow any origin – you can restrict later
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  // Handle preflight OPTIONS immediately
  if (req.method === 'OPTIONS') {
    console.log('🔄 OPTIONS preflight:', req.url);
    res.sendStatus(200);
    return;
  }

  next();
});

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
    origin: '*',
    methods: ['GET', 'POST'],
  },
});
app.set('io', io);

io.on('connection', (socket) => {
  console.log('✅ New client connected:', socket.id);
  // ... (keep the rest of socket handlers as before)
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

// 404 and error handlers...
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
