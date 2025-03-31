const express = require("express");
const Razorpay = require("razorpay");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
dotenv.config();

const app = express();
app.use(bodyParser.json());

const cors = require('cors');
app.use(cors());

const twilio = require('twilio');
const client = new twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});

app.get('/', (req, res) => {
    res.send('Welcome to GoCab Payment Service');
});


app.post("/create-order", async (req, res) => {
    try {
        const { amount, currency } = req.body;

        const order = await razorpay.orders.create({
            amount: amount * 100,
            currency,
            payment_capture: 1
        });

        return res.json({ orderId: order.id });
    } catch (error) {
        console.error("Error creating order:", error);
        res.status(500).json({ error: "Failed to create order" });
    }
});


app.post("/verify-payment", async (req, res) => {
    try {
        const { razorpay_payment_id, razorpay_order_id, razorpay_signature, amount, driverAccountId, driverPhone } = req.body;

        const crypto = require("crypto");
        const expectedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(razorpay_order_id + "|" + razorpay_payment_id)
            .digest("hex");

        if (expectedSignature !== razorpay_signature) {
            return res.status(400).json({ error: "Invalid payment signature" });
        }

        await client.messages.create({
            body: `Payment of ₹${amount} received successfully.`,
            from: process.env.TWILIO_PHONE_NUMBER,
            to: driverPhone
        });

        return res.json({ success: true, message: "Payment successful" });
    } catch (error) {
        console.error("Payment verification failed:", error);
        res.status(500).json({ error: "Payment verification failed" });
    }
});

module.exports = app;