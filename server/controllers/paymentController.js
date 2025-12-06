const asyncHandler = require('express-async-handler');
const Stripe = require('stripe');
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

// @desc    Create payment intent
// @route   POST /api/payment/create-payment-intent
// @access  Private
const createPaymentIntent = asyncHandler(async (req, res) => {
    const { amount } = req.body;

    const paymentIntent = await stripe.paymentIntents.create({
        amount,
        currency: 'usd',
        automatic_payment_methods: {
            enabled: true,
        },
    });

    res.send({
        clientSecret: paymentIntent.client_secret,
    });
});

module.exports = { createPaymentIntent };
