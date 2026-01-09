const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const path = require('path');
const dotenv = require('dotenv');
const User = require('../models/User');

dotenv.config({ path: path.join(__dirname, '../.env') });

const run = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const user = await User.findOne();
        if (!user) {
            console.error('No user found in DB');
            process.exit(1);
        }

        const payload = {
            user: {
                id: user.id,
                role: user.role,
            }
        };

        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1d' });
        console.log('--- TEST JWT GENERATED ---');
        console.log('User ID:', user.id);
        console.log('Token:', token);
        console.log('\nUse this token to test with curl:');
        console.log(`curl -X POST http://localhost:3000/api/courses \\
  -H "x-auth-token: ${token}" \\
  -F "name=Test Channel" \\
  -F "category=Development" \\
  -F "description=Test Description"`);

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

run();
