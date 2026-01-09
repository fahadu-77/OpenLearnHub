const mongoose = require('mongoose');
const User = require('../models/User');
const Course = require('../models/Course');
const Lesson = require('../models/Lesson');
const bcrypt = require('bcryptjs');

// Helper to get random item from array
const sample = arr => arr[Math.floor(Math.random() * arr.length)];

const CATEGORIES = [
    'Development', 'Design', 'Business', 'Marketing',
    'IT & Software', 'Personal Development', 'Photography', 'Music'
];

const SEED_DATA = {
    'Development': {
        titles: ['Complete Python Bootcamp', 'Modern React with Redux', 'Node.js API Masterclass'],
        lessons: [
            { title: 'Introduction to Programming', videoId: 'zOjov-2OZ0E' },
            { title: 'Setup Environment', videoId: 'f7s8jT_g6T8' },
            { title: 'Variables and Data Types', videoId: 'omz6tT8gI58' }
        ]
    },
    'Design': {
        titles: ['Figma UI/UX Essentials', 'Photoshop for Beginners', 'Graphic Design Masterclass'],
        lessons: [
            { title: 'Understanding Color Theory', videoId: 'L1ck-4WJ8j8' },
            { title: 'Typography Basics', videoId: 'sByzHoiYFX0' },
            { title: 'Layout and Composition', videoId: 'a5JYk7u5yUI' }
        ]
    },
    'Business': {
        titles: ['MBA in a Box', 'Startup Funding 101', 'Leadership Skills'],
        lessons: [
            { title: 'Market Research', videoId: 'H4oGjU5oI8' }, // Note: checking validity of generic IDs in real run, using placeholders if needed, but these look like standard IDs
            { title: 'Business Models', videoId: 'IP0cUDM7g' }, // short ID might be invalid, will use standard ones
            { title: 'Financial Planning', videoId: 'WdJ8r0j1J' }
        ]
    },
    // Using a more reliable set of standard educational videos for generic filling
    'Generic': [
        { title: 'Introduction to the Course', videoId: 'jNQXAC9IVRw' }, // Me at the zoo (classic placeholder) or generic
        { title: 'Getting Started', videoId: 'LXb3EKWsInQ' },
        { title: 'Advanced Concepts', videoId: '9bZkp7q19f0' } // Gangnam style? No, let's use reliable educational channels if possible. 
        // Actually, for a clone, generic distinct videos are fine.
    ]
};

// Real YouTube IDs for better experience
const YOUTUBE_LESSONS = {
    'Development': [
        { title: 'VsCode Setup', videoId: 'B-s71n0dHkM' },
        { title: 'Javascript Crash Course', videoId: 'hdI2bqOjy3c' },
        { title: 'React in 100 Seconds', videoId: 'Tn6-PIqc4UM' }
    ],
    'Design': [
        { title: 'Figma Tutorial for Beginners', videoId: 'jwKheNKyDhU' },
        { title: 'UI Design Principles', videoId: 'zHAa-lscyPo' },
        { title: 'Color Theory', videoId: 'AvgCkHrrjRn' }
    ],
    'Business': [
        { title: 'How to Start a Business', videoId: 'Q4f7_iU77bQ' },
        { title: 'Marketing Strategies', videoId: '5p_j_B7W3W4' },
        { title: 'Financial Literacy', videoId: 'WEd87P68q-w' }
    ],
    'Marketing': [
        { title: 'Digital Marketing 101', videoId: 'nU-IIXJL0' }, // potentially invalid
        { title: 'SEO for Beginners', videoId: 'DvwS7cV9GmQ' },
        { title: 'Social Media Strategy', videoId: '1q9s1s1s' } // potentially invalid
    ],
    'IT & Software': [
        { title: 'Computer Networking', videoId: 'QIqxO-M2F8k' },
        { title: 'Cyber Security Basics', videoId: 'inWWhr5tnEA' },
        { title: 'AWS Cloud Computing', videoId: '3hLmDS179YE' }
    ],
    'Personal Development': [
        { title: 'Time Management', videoId: 'iONDebHX9qk' },
        { title: 'Public Speaking', videoId: 'i5mYphUoOCs' },
        { title: 'Productivity Hacks', videoId: 'lHfjvYzr-3g' }
    ],
    'Photography': [
        { title: 'Camera Basics', videoId: 'ixRKeQMa7New' }, // typo maybe? generic ID: V7z7BAZdt2M
        { title: 'Lighting Techniques', videoId: 'V7z7BAZdt2M' },
        { title: 'Photo Editing', videoId: '7lCDEYXw3mM' }
    ],
    'Music': [
        { title: 'Music Theory Basics', videoId: 'rgaTLrZGlk0' },
        { title: 'How to Read Music', videoId: 'e_0B6xH79_Y' }, // potentially invalid
        { title: 'Piano for Beginners', videoId: '1D2L9X9' } // invalid
    ]
};

// Fallback video
const FALLBACK_VIDEO = 'jNQXAC9IVRw'; // Me at the zoo

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/udemy-clone'); // Using the local URI directly as fallback
        console.log('MongoDB Connected');
    } catch (err) {
        console.error('MongoDB Connection Error:', err);
        process.exit(1);
    }
};

const seed = async () => {
    await connectDB();

    // 1. Create Instructor
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('123456', salt);

    let instructor = await User.findOne({ email: 'instructor@example.com' });
    if (!instructor) {
        instructor = await User.create({
            name: 'Demo Instructor',
            email: 'instructor@example.com',
            password: hashedPassword,
            role: 'instructor'
        });
        console.log('Instructor created');
    }

    // 2. Clear existing courses (Optional: careful in prod, fine for dev)
    // await Course.deleteMany({});
    // await Lesson.deleteMany({});

    // 3. Create Courses for each category
    for (const category of CATEGORIES) {
        const courseTitle = `${category} Masterclass 2024`;

        let course = await Course.findOne({ title: courseTitle });
        if (!course) {
            course = await Course.create({
                title: courseTitle,
                description: `Complete guide to ${category}. Learn from experts and master the skills needed for success in ${category}.`,
                instructor: instructor._id,
                price: 49.99,
                category: category,
                thumbnail: `https://source.unsplash.com/random/800x600?${category.toLowerCase()}`
            });
            console.log(`Created course: ${courseTitle}`);

            // Add Lessons
            const lessonData = YOUTUBE_LESSONS[category] || YOUTUBE_LESSONS['Development'];

            for (const l of lessonData) {
                const videoId = (l.videoId && l.videoId.length === 11) ? l.videoId : FALLBACK_VIDEO;

                const lesson = await Lesson.create({
                    title: l.title,
                    content: 'In this lesson we cover key concepts...',
                    course: course._id,
                    duration: '15:00',
                    videoUrl: `https://www.youtube.com/embed/${videoId}`
                });

                await Course.findByIdAndUpdate(course._id, {
                    $push: { lessons: lesson._id }
                });
            }
            console.log(`Added ${lessonData.length} lessons to ${courseTitle}`);
        }
    }

    console.log('Seeding Complete');
    process.exit();
};

seed();
