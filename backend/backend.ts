import express from 'express'
import authRouter from './routes/auth.routes';
import connectdb from './config/db';
import productRouter from './routes/product.routes';
import cookieParser from 'cookie-parser'
import cartRouter from './routes/card.routes';
import orderRouter from './routes/order.routes';

const app = express()
app.use(express.json())
app.use(cookieParser())

app.use("/api/auth",authRouter)
app.use("/api/product",productRouter)
app.use("/api/cart", cartRouter);
app.use("/api/order",orderRouter)
const port = 5000
app.listen(port, () => {
    console.log(`Server Running ${port}`);
    connectdb()
});
