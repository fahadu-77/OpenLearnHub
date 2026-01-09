const express = require('express');
const dotenv = require('dotenv');
dotenv.config();
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json({
    verify: (req, res, buf) => {
        req.rawBody = buf;
    }
}));
app.use(cors());
app.use('/uploads', express.static('uploads'));

// Database Connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.error('MongoDB Connection Error:', err));

// Routes
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/courses', require('./routes/course.routes'));
app.use('/api/lessons', require('./routes/lesson.routes'));
app.use('/api/payment', require('./routes/payment.routes'));
app.use('/api/progress', require('./routes/progress.routes'));
app.use('/api/admin', require('./routes/admin.routes'));
app.use('/api/answers', require('./routes/answer.routes'));


app.get('/', (req, res) => {
    res.send('API is running...');
});

app.use(require('./middleware/errorHandler'));

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
