require('dotenv').config();
const mongoose = require('mongoose');
const Course = require('../models/Course');
const Lesson = require('../models/Lesson');
const User = require('../models/User');
const { YoutubeTranscript } = require('youtube-transcript');

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.error(err));

const POPULAR_COURSES = [
    {
        title: "The Ultimate React Guide 2024",
        description: "Master React from scratch. Hooks, Redux, Router, and Next.js.",
        price: 49.99,
        category: "Development",
        thumbnail: "https://i.ytimg.com/vi/SqcY0GlETPk/maxresdefault.jpg",
        videos: [
            { title: "React Tutorial for Beginners", url: "https://www.youtube.com/watch?v=SqcY0GlETPk", duration: "120", isFree: true },
            { title: "React Hooks Explained", url: "https://www.youtube.com/watch?v=TNhaISOUy6Q", duration: "45", isFree: false }
        ]
    },
    {
        title: "Python for Data Science Bootcamp",
        description: "Learn Python specifically for Data Science. Pandas, NumPy, Matplotlib.",
        price: 59.99,
        category: "Development",
        thumbnail: "https://i.ytimg.com/vi/LHBE6Q9XlzI/maxresdefault.jpg",
        videos: [
            { title: "Python for Beginners - Full Course", url: "https://www.youtube.com/watch?v=_uQrJ0TkZlc", duration: "360", isFree: true },
            { title: "Data Analysis with Python", url: "https://www.youtube.com/watch?v=r-uOLxNrNk8", duration: "60", isFree: false }
        ]
    },
    {
        title: "Digital Marketing Strategy 2024",
        description: "Comprehensive guide to SEO, Social Media Marketing, and Email Marketing.",
        price: 39.99,
        category: "Marketing",
        thumbnail: "https://i.ytimg.com/vi/bixR-KIJKYM/maxresdefault.jpg",
        videos: [
            { title: "Digital Marketing Course for Beginners", url: "https://www.youtube.com/watch?v=bixR-KIJKYM", duration: "180", isFree: true },
            { title: "SEO for Beginners: Rank #1", url: "https://www.youtube.com/watch?v=DvwS7cV9GmQ", duration: "50", isFree: true }
        ]
    },
    {
        title: "Music Theory for Producers",
        description: "Understand scales, chords, and melody to produce better music.",
        price: 29.99,
        category: "Music",
        thumbnail: "https://i.ytimg.com/vi/rgaTLrZGlk0/maxresdefault.jpg",
        videos: [
            { title: "Basic Music Theory", url: "https://www.youtube.com/watch?v=rgaTLrZGlk0", duration: "40", isFree: true }
        ]
    }
];

// Mock Transcripts for Demo
const MOCK_TRANSCRIPTS = {
    "React Tutorial for Beginners": "Welcome to this React tutorial. Today we will learn about components, props, and state. React is a popular library for building user interfaces. We start by creating a simple component. Components are the building blocks of React applications. Next, let's talk about Props. Props allow us to pass data between components. finally, we will cover State, which allows components to manage their own data.",
    "React Hooks Explained": "In this video, we dive deep into React Hooks. We will cover useState and useEffect. useState allows you to add state to functional components. useEffect lets you perform side effects like data fetching. Hooks were introduced in React 16.8 and have revolutionized how we write React code.",
    "Python for Beginners - Full Course": "Python is an amazing language for beginners. It has a clean syntax and a massive ecosystem. We will cover variables, loops, and functions. Python is widely used in Data Science, Web Development, and Automation. Let's write our first Hello World program.",
    "Data Analysis with Python": "Data Analysis is key to understanding business metrics. We will use Pandas to load data frames. Pandas makes it easy to manipulate structured data. We can filter, sort, and group our data to find insights.",
    "Digital Marketing Course for Beginners": "Digital marketing is essential for modern business. We will discuss SEO, Content Marketing, and Social Media. SEO helps you rank higher on Google. Content Marketing builds trust with your audience. Social Media allows you to engage directly with customers.",
    "SEO for Beginners: Rank #1": "Search Engine Optimization is the art of ranking high on search engines. Key factors include keywords, backlinks, and content quality. You need to optimize your meta tags and ensure your site is mobile-friendly.",
    "Basic Music Theory": "Music theory is the grammar of music. We will learn about the major scale and chords. The C Major scale has no sharps or flats. Chords are built by stacking thirds. Understanding this helps you write better melodies."
};

const seed = async () => {
    try {
        // Find instructor
        const instructor = await User.findOne({ email: 'fahadkallu2002@gmail.com' });
        if (!instructor) {
            console.log('Instructor not found. Make sure user exists.');
            process.exit(1);
        }

        console.log(`Seeding courses for instructor: ${instructor.name}`);

        for (const courseData of POPULAR_COURSES) {
            // Create Course
            const course = new Course({
                title: courseData.title,
                description: courseData.description,
                price: courseData.price,
                thumbnail: courseData.thumbnail,
                category: courseData.category,
                instructor: instructor._id,
            });

            await course.save();
            console.log(`Created Course: ${course.title}`);

            // Create Lessons
            for (const vid of courseData.videos) {
                // Use Mock Transcript
                const transcriptText = MOCK_TRANSCRIPTS[vid.title] || "Standard transcript text for this lesson...";

                const lesson = new Lesson({
                    title: vid.title,
                    content: `Tutorial video: ${vid.title}`,
                    duration: vid.duration,
                    videoUrl: vid.url,
                    transcript: transcriptText,
                    isFree: vid.isFree,
                    course: course._id,
                });

                await lesson.save();
                course.lessons.push(lesson._id);
            }
            await course.save();
        }

        console.log('Database enrichment completed successfully!');
        process.exit(0);

    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

seed();
