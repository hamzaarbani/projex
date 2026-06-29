import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { useSocket } from '../hooks/useSocket';
import api from '../utils/api';
import { PaperAirplaneIcon } from '@heroicons/react/24/solid';
import toast from 'react-hot-toast';

const Chat = () => {
  const { user } = useSelector((state) => state.auth);
  const { workspaces } = useSelector((state) => state.workspaces);
  const [selectedWorkspace, setSelectedWorkspace] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const socket = useSocket(selectedWorkspace?._id || null);
  const messagesEndRef = useRef(null);

  // Auto-select first workspace
  useEffect(() => {
    if (workspaces.length > 0 && !selectedWorkspace) {
      setSelectedWorkspace(workspaces[0]);
    }
  }, [workspaces, selectedWorkspace]);

  // Fetch message history
  useEffect(() => {
    if (!selectedWorkspace) return;
    const fetchMessages = async () => {
      try {
        const res = await api.get(`/messages/${selectedWorkspace._id}`);
        setMessages(res.data);
      } catch (err) {
        console.error('Failed to fetch messages', err);
      }
    };
    fetchMessages();
  }, [selectedWorkspace]);

  // Listen for new messages via socket
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (msg) => {
      setMessages((prev) => [...prev, msg]);
    };

    socket.on('new-message', handleNewMessage);

    return () => {
      socket.off('new-message', handleNewMessage);
    };
  }, [socket]);

  // Scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = (e) => {
    e.preventDefault();
    if (!input.trim() || !selectedWorkspace || !user) return;

    const messageData = {
      workspaceId: selectedWorkspace._id,
      text: input,
      sender: user._id,
      senderName: user.name,
    };

    // Emit to socket
    socket.emit('send-message', messageData);

    // Optimistically add message to UI (optional – socket will broadcast it back)
    // But we'll let the socket broadcast it to all clients including sender.
    setInput('');
  };

  if (!user) {
    return <div className="p-6 text-center text-gray-500">Loading user...</div>;
  }

  return (
    <div className="h-[calc(100vh-120px)] flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Team Chat</h1>
        {workspaces.length > 0 && (
          <select
            value={selectedWorkspace?._id || ''}
            onChange={(e) => {
              const ws = workspaces.find((w) => w._id === e.target.value);
              setSelectedWorkspace(ws);
              setMessages([]);
            }}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          >
            {workspaces.map((ws) => (
              <option key={ws._id} value={ws._id}>
                {ws.name}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Chat container */}
      <div className="flex-1 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col overflow-hidden">
        {/* Messages */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3">
          {messages.length === 0 && (
            <p className="text-center text-gray-500 dark:text-gray-400 mt-10">
              No messages yet. Start the conversation!
            </p>
          )}
          {messages.map((msg, idx) => {
            const isMine = msg.sender?._id === user._id;
            return (
              <div key={idx} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-xs px-4 py-2 rounded-2xl ${
                    isMine
                      ? 'bg-indigo-500 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                  }`}
                >
                  {!isMine && (
                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
                      {msg.sender?.name || 'Unknown'}
                    </p>
                  )}
                  <p className="text-sm">{msg.text}</p>
                  <p className="text-xs opacity-70 mt-1">
                    {new Date(msg.createdAt).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <form onSubmit={sendMessage} className="p-4 border-t border-gray-200 dark:border-gray-700 flex gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          />
          <button
            type="submit"
            disabled={!selectedWorkspace}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition flex items-center gap-2 disabled:opacity-50"
          >
            <PaperAirplaneIcon className="w-5 h-5" />
            Send
          </button>
        </form>
      </div>
    </div>
  );
};

export default Chat;