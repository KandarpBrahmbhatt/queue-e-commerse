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