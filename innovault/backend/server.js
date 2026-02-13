const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(cors());

// Database Connection
mongoose.connect(process.env.DATABASE_URL || 'mongodb://localhost:27017/innovault', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
    .then(() => console.log('Connected to Innovault Database'))
    .catch(err => console.error('Database connection failed:', err));

// Routes
const authRoutes = require('./routes/auth');
const projectRoutes = require('./routes/projects');

app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);

app.get('/', (req, res) => {
    res.send('Innovault API is running...');
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
