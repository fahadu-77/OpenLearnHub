require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const bcrypt = require('bcryptjs');

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.error(err));

const createInstructor = async () => {
    try {
        const email = 'instructor@test.com';
        const password = 'password123';

        // Check if exists
        let user = await User.findOne({ email });
        if (user) {
            console.log('User already exists. Updating password/role...');
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(password, salt);
            user.role = 'instructor';
            await user.save();
        } else {
            console.log('Creating new instructor...');
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);
            user = new User({
                name: 'Test Instructor',
                email,
                password: hashedPassword,
                role: 'instructor'
            });
            await user.save();
        }
        console.log(`Instructor setup complete: ${email} / ${password}`);
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

createInstructor();
