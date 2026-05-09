const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { initializePool, closePool } = require('./config/database');

// Import routes
const authRoutes = require('./routes/auth');
const issueRoutes = require('./routes/issues');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'API is running ✅' });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/issues', issueRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: err.message || 'Internal server error' });
});

// Initialize database and start server
(async () => {
  try {
    await initializePool();
    console.log('✅ Database initialized');

    app.listen(PORT, () => {
      console.log(`🚀 NagarVoice Backend running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
})();

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\nShutting down gracefully...');
  await closePool();
  process.exit(0);
});
