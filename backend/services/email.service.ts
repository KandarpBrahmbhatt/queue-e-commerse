import { transporter } from "../config/mail";

export const sendWelcomeEmail = async (email: string, name: string) => {
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
    totalAmount: number,
    pdfPath?: string
) => {
    const mailOptions: any = {
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
    };

    if (pdfPath) {
        mailOptions.attachments = [
            {
                filename: "invoice.pdf",
                path: pdfPath,
            },
        ];
    }

    await transporter.sendMail(mailOptions);
};



export const sendInvoiceEmail = async (email: string, name: string, orderNumber: string, pdfPath: string) => {

    await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,

        subject: "Payment Successful",

        html: `
            <h2>Hello ${name},</h2>

            <p>Your payment was successful.</p>

            <p>Order Number: ${orderNumber}</p>

            <p>Your invoice is attached.</p>

            <p>Thank you for shopping with us.</p>
        `,

        attachments: [
            {
                filename: `invoice-${orderNumber}.pdf`,
                path: pdfPath,
            },
        ],
    });
};


export const sendOTP = async (to: string, otp: string) => {
    await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to,
        subject: "Reset Your Password",
        html: `
            <p>Your OTP for password reset is <b>${otp}</b>.</p>
            <p>It expires in 5 minutes.</p>
        `,
    });
};



export const sendDiscountEmail = async (email: string, name: string) => {
    try {
        console.log(` Sending discount email to ${email}`);

        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: " 50% Discount Offer!",
            html: `
                <h2>Hello ${name},</h2>
                <p> You got a 50% discount offer!</p>
                <p>Shop now before it expires.</p>
            `
        });

        console.log(`Email sent to ${email}`);

    } catch (error) {
        console.log(" Email send error:", error);
    }
};