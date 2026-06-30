import twilio from "twilio";
import dotenv from 'dotenv'
dotenv.config()

const client = twilio(
    process.env.TWILIO_ACCOUNT_SID?.trim()!,
    process.env.TWILIO_AUTH_TOKEN?.trim()!
);

export const sendSMS = async (
    phone: string,
    message: string
) => {
    let formattedPhone = phone.trim();
    if (!formattedPhone.startsWith("+")) {
        // Assume +91 (India) if it is a 10-digit number
        if (formattedPhone.length === 10) {
            formattedPhone = `+91${formattedPhone}`;
        } else if (formattedPhone.startsWith("0") && formattedPhone.length === 11) {
            formattedPhone = `+91${formattedPhone.substring(1)}`;
        }
    }

    console.log(`Sending SMS to ${formattedPhone} using Twilio...`);

    await client.messages.create({
        body: message,
        from: process.env.TWILIO_PHONE_NUMBER?.trim(),
        to: formattedPhone,
    });
};