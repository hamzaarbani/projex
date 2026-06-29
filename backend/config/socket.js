const { Server } = require('socket.io');

let io;
module.exports = {
  init: (server) => {
    io = new Server(server, {
      cors: { origin: process.env.CLIENT_URL, methods: ['GET', 'POST'] }
    });
    io.on('connection', (socket) => {
      console.log('New client connected');
      // Join user to workspace rooms based on their workspaces
      socket.on('join-workspace', (workspaceId) => {
        socket.join(`workspace-${workspaceId}`);
      });
      // Handle chat messages
      socket.on('send-message', (data) => {
        io.to(`workspace-${data.workspaceId}`).emit('new-message', data);
      });
      // Handle real-time task updates (e.g., status change)
      socket.on('task-updated', (task) => {
        io.to(`workspace-${task.workspaceId}`).emit('task-changed', task);
      });
      socket.on('disconnect', () => { /* clean up */ });
    });
    return io;
  },
  getIO: () => { if (!io) throw new Error('Socket.io not initialized'); return io; }
};