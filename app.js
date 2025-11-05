const path = require('path');
const fs = require('fs');
const express = require('express');
const OS = require('os');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors');
const serverless = require('serverless-http');

const app = express();

// Middleware setup
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '/')));
app.use(cors());

// MongoDB URI — local Docker container
const MONGO_URI = 'mongodb://testUser:testPass@127.0.0.1:27017/solarSystemDB?authSource=admin';

// Define Mongoose Schema and Model
const Schema = mongoose.Schema;
const dataSchema = new Schema({
  name: String,
  id: Number,
  description: String,
  image: String,
  velocity: String,
  distance: String
});
const planetModel = mongoose.model('planets', dataSchema);

// Connect to MongoDB and seed data
mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(async () => {
  console.log(`✅ Connected to MongoDB: ${MONGO_URI}`);
})
.catch(err => {
  console.error('❌ MongoDB connection error:', err);
});

// Routes
app.post('/planet', (req, res) => {
  planetModel.findOne({ id: req.body.id }, (err, planetData) => {
    if (err) {
      console.error('Error fetching planet data:', err);
      return res.status(500).send('Error fetching planet data');
    } else if (!planetData) {
      return res.status(404).send('Planet not found');
    } else {
      return res.status(200).send(planetData);
    }
  });
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/api-docs', (req, res) => {
  fs.readFile('oas.json', 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading file:', err);
      return res.status(500).send('Error reading file');
    } else {
      return res.json(JSON.parse(data));
    }
  });
});

app.get('/os', (req, res) => {
  res.json({
    os: OS.hostname(),
    env: process.env.NODE_ENV || 'development'
  });
});

app.get('/live', (req, res) => {
  res.json({ status: 'live' });
});

app.get('/ready', (req, res) => {
  res.json({ status: 'ready' });
});

// Start server
const PORT = 3000;
const HOST = '0.0.0.0';
app.listen(PORT, () => {
  console.log(`🚀 Server successfully running on port ${PORT}`);
});

module.exports = app;
// module.exports.handler = serverless(app);
