const Course = require('../models/Course');
const User = require('../models/User');
const Lesson = require('../models/Lesson');

exports.createChannel = async (req, res) => {
    try {
        const { name, description, price, category } = req.body;

        if (!name || !category) {
            return res.status(400).json({ msg: 'Channel name and category are required' });
        }

        let thumbnail = '';
        if (req.file) {
            thumbnail = req.file.path || req.file.url || req.file.secure_url;
        } else if (req.body.thumbnail) {
            thumbnail = req.body.thumbnail;
        }

        // Auto-upgrade student to instructor (creator)
        const user = await User.findById(req.user.id);
        if (user && user.role === 'student') {
            user.role = 'instructor';
            await user.save();
        }

        const channel = new Course({
            title: name,
            description: description || `Welcome to ${name} channel.`,
            price: price || 0,
            thumbnail,
            category: category,
            instructor: req.user.id,
        });

        await channel.save();
        res.json(channel);
    } catch (err) {
        console.error('Create Channel Error:', err.message);
        res.status(500).send('Server Error');
    }
};

exports.getAllCourses = async (req, res) => {
    try {
      
        const { category, instructor } = req.query;

        const filter = {};
        if (category) filter.category = category;
        if (instructor) filter.instructor = instructor;

        const courses = await Course.find(filter)
            .populate('instructor', 'name email');

        const isInstructorRequest =
            req.user && req.user.role === 'instructor';

        const coursesWithStats = await Promise.all(
            courses.map(async (course) => {
                const lessonFilter = {
                    course: course._id
                };

                // 🔒 Students see only published lessons
                if (!isInstructorRequest) {
                    lessonFilter.status = 'published';
                }

                const lessonCount = await Lesson.countDocuments(lessonFilter);

                return {
                    ...course.toObject(),
                    lessonCount
                };
            })
        );

        res.json(coursesWithStats);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};


exports.getCourseById = async (req, res) => {
    try {
        const course = await Course.findById(req.params.id)
            .populate('instructor', 'name email')
            .populate('lessons');

        if (!course) {
            console.log("Course not found for ID:", req.params.id);
            return res.status(404).json({ msg: 'Course not found' });
        }

        const courseObj = course.toObject();

        res.json(courseObj);
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'Course not found' });
        }
        res.status(500).send('Server Error');
    }
};

exports.enrollChannel = async (req, res) => {
    try {
        const { channelId } = req.body;
        const userId = req.user.id;

        const channel = await Course.findById(channelId);
        if (!channel) return res.status(404).json({ msg: 'Channel not found' });

        const user = await User.findById(userId);

        if (user.enrolledCourses.includes(channelId)) {
            return res.status(400).json({ msg: 'Already enrolled in this channel' });
        }

        if (channel.price > 0) {
            return res.status(403).json({ msg: 'Payment required. Please use the checkout flow.' });
        }

        user.enrolledCourses.push(channelId);
        await user.save();


        res.json({ msg: 'Successfully enrolled in channel', enrolledChannels: user.enrolledCourses });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

exports.deleteCourse = async (req, res) => {
    try {
        const courseId = req.params.id;
        const course = await Course.findById(courseId);

        if (!course) {
            return res.status(404).json({ msg: 'Course not found' });
        }

        // Check ownership (only instructor can delete)
        if (course.instructor.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'User not authorized to delete this course' });
        }

        // 1. Delete all associated lessons
        await Lesson.deleteMany({ course: courseId });

        // 2. Remove course from any enrolled users (Optional but recommended)
        await User.updateMany(
            { enrolledCourses: courseId },
            { $pull: { enrolledCourses: courseId } }
        );

        // 3. Delete the course itself
        await Course.findByIdAndDelete(courseId);

        res.json({ msg: 'Channel and all associated lessons removed successfully' });
    } catch (err) {
        console.error('Delete Course Error:', err.message);
        res.status(500).send('Server Error');
    }
};
