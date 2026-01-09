const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User'); // Adjust path as needed
require('dotenv').config();

const seedAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected for Seeding');

        const adminEmail = 'admin@olh.com';
        const adminPassword = '111111';
        const adminName = 'System Admin';

        // Check if admin exists
        let admin = await User.findOne({ email: adminEmail });
        if (admin) {
            console.log('Admin user already exists. Skipping creation.');
            process.exit(0);
        }

        // Create admin
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(adminPassword, salt);

        admin = new User({
            name: adminName,
            email: adminEmail,
            password: hashedPassword,
            role: 'admin'
        });

        await admin.save();
        console.log('Bootstrap Admin Created Successfully');
        console.log(`Email: ${adminEmail}`);
        console.log(`Role: ${admin.role}`);

        process.exit(0);
    } catch (err) {
        console.error('Seeding Failed:', err);
        process.exit(1);
    }
};

seedAdmin();
