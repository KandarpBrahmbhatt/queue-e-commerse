import express from "express";
import {
    addToCart,
    getCart,
    removeFromCart,
} from "../controller/AddtoCard.controller";

import { isAuth } from "../middaleware/auth.middleware";

const cartRouter = express.Router();

cartRouter.post(
    "/add",
    isAuth,
    addToCart
);

cartRouter.get(
    "/get",
    isAuth,
    getCart
);

cartRouter.delete(
    "/remove/:productId",
    isAuth,
    removeFromCart
);

export default cartRouter;