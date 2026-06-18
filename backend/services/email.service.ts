import { transporter } from "../config/mail";

export const sendWelcomeEmail = async (email: string,name: string) => {
    await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: "Welcome to Queue E-Commerce",
        html: `
            <h2>Welcome ${name}</h2>
            <p>Thank you for registering with us.</p>
        `,
    });
};


export const sendAbandonedCartEmail =
    async (email: string) => {
        console.log(
            `Sending abandoned cart email to ${email}`
        );

        await new Promise((resolve) =>
            setTimeout(resolve, 3000)
        );

        console.log(
            `Email sent to ${email}`
        );
    };



export const sendOrderConfirmationEmail = async (
    email: string,
    name: string,
    orderNumber: string,
    totalAmount: number
) => {

    await transporter.sendMail({
        from: process.env.EMAIL_USER,

        to: email,

        subject: "Order Confirmation",

        html: `
            <h2>Hello ${name},</h2>

            <p>Your order has been placed successfully.</p>

            <p>
                Order Number:
                <strong>${orderNumber}</strong>
            </p>

            <p>
                Total Amount:
                <strong>₹${totalAmount}</strong>
            </p>

            <p>Thank you for shopping with us.</p>
        `,
    });
};