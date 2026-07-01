import express from 'express'
import authRouter from './routes/auth.routes';
import connectdb from './config/db';
import productRouter from './routes/product.routes';
import cookieParser from 'cookie-parser'
import cartRouter from './routes/card.routes';
import orderRouter from './routes/order.routes';
import paymentRouter from './routes/payment.routes';
import { stripeWebhook } from './controller/payment.controller';
import pdfRouter from './routes/pdf.routes';

// Import workers to start listening and processing background queue jobs
import './worker/cart.worker';
import './worker/email.worker';
import './worker/invoice.worker';
import './worker/order.worker';
import './worker/notification.worker';
import addressRouter from './routes/address.routes';
import { initSocket } from './socket/socket';
import http from 'http'
import dotenv from "dotenv";
import reviewRouter from './routes/review.routes';
import couponRouter from './routes/coupon.routes';
import currentProfileRouter from './routes/cuurent.routes';
import inventoryRouter from './routes/inventory.routes';
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./swagger/swagger";
import dashboardRouter from './routes/dashboard.routes';
import securityRouter from './routes/security.routes';
import { deviceMiddleware } from './middaleware/device.middleware';
dotenv.config();
const app = express()

const server = http.createServer(app)
initSocket(server)


app.use(deviceMiddleware);
// Stripe webhooks require the raw request body (Buffer) to verify the cryptographic signature.
// Using express.raw() middleware specifically for this route preserves the raw body.
// This route must be registered before express.json() is applied globally.
app.use("/api/payment/webhook", express.raw({ type: "application/json" }), stripeWebhook)
app.use(express.json())
app.use(cookieParser())
app.use(
    "/api-docs",
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec)
);
app.use("/api/auth",authRouter)
app.use("/api/product",productRouter)
app.use("/api/cart", cartRouter);
app.use("/api/order",orderRouter)
app.use("/api/payment",paymentRouter)
app.use("/api/invoice",pdfRouter)
app.use("/api/address",addressRouter)
app.use("/api/review",reviewRouter)
app.use("/api/coupon",couponRouter)
app.use("/api/profile",currentProfileRouter)
app.use("/api/inventory",inventoryRouter)
app.use("/api/dashboard",dashboardRouter)
app.use("/api/security", securityRouter);
const port = 5000
// app.listen(port, () => {
//     console.log(`Server Running ${port}`);
//     connectdb()
// });

server.listen(port, () => {
  console.log(`Server Running ${port}`);
});

// merge the code dev and main 