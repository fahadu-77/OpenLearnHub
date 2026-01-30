const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Course = require('../models/Course');
const User = require('../models/User');
const Payment = require('../models/Payment');
const auth = require('../middleware/auth');

/**
 * Shared helper to handle successful payment and enrollment
 * This is used by both the webhook and the manual verification endpoint.
 */
const fulfillOrder = async (session) => {
//   console.log('[WEBHOOK] session metadata:', session.metadata);
// console.log('[WEBHOOK] client_reference_id:', session.client_reference_id);

  const userId = session.metadata.userId || session.client_reference_id;
  const courseId = session.metadata.courseId;
  const amount = session.amount_total / 100;
  const currency = session.currency;

  if (!userId || !courseId) {
    throw new Error('Missing metadata in session');
  }

  // 1. Record Payment (Idempotent)
  let payment = await Payment.findOne({ stripeSessionId: session.id });
  if (!payment) {
    payment = new Payment({
      user: userId,
      course: courseId,
      stripeSessionId: session.id,
      amount: amount,
      currency: currency,
      status: 'completed'
    });
    await payment.save();
    console.log(`[fulfillment] Payment recorded: ${payment._id}`);
  }

  const course = await Course.findById(courseId);
if (!course) {
  throw new Error(`Course not found: ${courseId}`);
}


  // 2. Enroll User (Idempotent)
  const user = await User.findById(userId);
  if (user) {
    const isAlreadyEnrolled = user.enrolledCourses.some(id => id.toString() === courseId);
    if (!isAlreadyEnrolled) {
      user.enrolledCourses.push(courseId);

      // Initialize progress tracking
      if (!user.learningProgress) user.learningProgress = [];
      const hasProgress = user.learningProgress.some(p => p.course.toString() === courseId);
      if (!hasProgress) {
        user.learningProgress.push({
          course: courseId,
          completedLessons: [],
          lastWatched: null
        });
      }

      await user.save();

      const alreadyInCourse = course.enrolledStudents?.some(
      id => id.toString() === userId
    );

    if (!alreadyInCourse) {
      course.enrolledStudents.push(userId);
      await course.save();
    }

      console.log(`[fulfillment] Success: Enrolled user ${userId} in course ${courseId}`);
      return { status: 'enrolled', user };
    } else {
      console.log(`[fulfillment] User ${userId} already enrolled`);
      return { status: 'already_enrolled', user };
    }
  } else {
    throw new Error(`User not found: ${userId}`);
  }
};

// @route   POST api/payment/create-checkout-session
router.post('/create-checkout-session', auth, async (req, res) => {
  try {
    const { courseId } = req.body;
    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ error: 'Course not found' });

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: {
            name: course.title,
            description: course.description,
            images: course.thumbnail ? [course.thumbnail] : [],
          },
          unit_amount: Math.round(course.price * 100),
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: `${process.env.CLIENT_URL}/course/${courseId}?success=true`,
      cancel_url: `${process.env.CLIENT_URL}/course/${courseId}?canceled=true`,
      client_reference_id: req.user.id,
      metadata: {
        userId: req.user.id,
        courseId: course._id.toString(),
      },
    });

    res.json({ url: session.url });
  } catch (error) {
    console.error('Stripe Checkout Error:', error);
    res.status(500).json({ error: error.message });
  }
});


// @route   POST api/payment/webhook
router.post('/webhook', async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error(`Webhook Error: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    if (session.payment_status === 'paid') {
      try {
        await fulfillOrder(session);
      } catch (err) {
        console.error('Webhook fulfillment failed:', err.message);
        return res.status(500).send('Fulfillment failed');
      }
    }
  }

  res.json({ received: true });
});



module.exports = router;