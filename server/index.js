const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const chatRoutes = require('./routes/chatRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Enhanced request logging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  console.log('Request body:', req.body);
  
  // Track response time
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[${new Date().toISOString()}] Response: ${res.statusCode} (${duration}ms)`);
  });
  
  next();
});

// Middleware
app.use(cors({
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST'],
  credentials: true
}));

app.use(bodyParser.json());

// Test route to verify server is running
app.get('/api/status', (req, res) => {
  console.log('Status endpoint called');
  res.json({ status: 'Server is running' });
});

// Routes
app.use('/api/chat', chatRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('ERROR CAUGHT IN MIDDLEWARE:');
  console.error(err.stack);
  res.status(500).json({ 
    error: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION:');
  console.error(err);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('UNHANDLED REJECTION:');
  console.error('Promise:', promise);
  console.error('Reason:', reason);
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Test the server: http://localhost:${PORT}/api/status`);
});