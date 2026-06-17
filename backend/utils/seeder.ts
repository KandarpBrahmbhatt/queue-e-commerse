
import mongoose from "mongoose";
import { faker } from "@faker-js/faker";

import User from "../models/user.model";
import Product, { ProductStatus } from "../models/product.model";
import { Cart } from "../models/card.model";

const MONGO_URI = "mongodb://localhost:27017/-e-com";

const TOTAL_USERS = 1000000;
const TOTAL_PRODUCTS = 1000000;
const BATCH_SIZE = 25000;

async function connectDB() {
    await mongoose.connect(MONGO_URI);
    console.log("MongoDB Connected");
}

async function seedUsers() {
    console.log("Seeding Users...");

    for (let i = 0; i < TOTAL_USERS; i += BATCH_SIZE) {
        const users = [];

        for (let j = 0; j < BATCH_SIZE && i + j < TOTAL_USERS; j++) {
            users.push({
                name: faker.person.fullName(),
                email: `user${i + j}@gmail.com`,
                password: "123456",
            });
        }

        await User.insertMany(users);

        console.log(
            `Users Inserted: ${Math.min(i + BATCH_SIZE, TOTAL_USERS)}`
        );
    }

    console.log("Users Seeded");
}

async function seedProducts() {
    console.log("Seeding Products...");

    for (let i = 0; i < TOTAL_PRODUCTS; i += BATCH_SIZE) {
        const products = [];

        for (let j = 0; j < BATCH_SIZE && i + j < TOTAL_PRODUCTS; j++) {
            products.push({
                name: faker.commerce.productName(),

                slug: `product-${i + j}`,

                description: faker.commerce.productDescription(),

                shortDescription: faker.commerce.product(),

                sku: `SKU-${i + j}`,

                price: faker.number.int({
                    min: 100,
                    max: 50000,
                }),

                discountPrice: faker.number.int({
                    min: 50,
                    max: 40000,
                }),

                currency: "INR",

                stock: faker.number.int({
                    min: 0,
                    max: 500,
                }),

                sold: faker.number.int({
                    min: 0,
                    max: 1000,
                }),

                category: new mongoose.Types.ObjectId(),

                images: [
                    faker.image.url(),
                    faker.image.url(),
                ],

                status: ProductStatus.ACTIVE,

                averageRating: faker.number.float({
                    min: 1,
                    max: 5,
                    fractionDigits: 1,
                }),

                totalReviews: faker.number.int({
                    min: 0,
                    max: 500,
                }),

                isDeleted: false,
            });
        }

        await Product.insertMany(products);

        console.log(
            `Products Inserted: ${Math.min(
                i + BATCH_SIZE,
                TOTAL_PRODUCTS
            )}`
        );
    }

    console.log("Products Seeded");
}

async function seedCarts() {
    console.log("Seeding Carts...");

    const users = await User.find()
        .select("_id")
        .limit(TOTAL_USERS)
        .lean();

    const products = await Product.find()
        .select("_id price")
        .limit(10000)
        .lean();

    for (let i = 0; i < users.length; i += BATCH_SIZE) {
        const carts = [];

        for (
            let j = 0;
            j < BATCH_SIZE && i + j < users.length;
            j++
        ) {
            const randomProduct =
                products[
                    Math.floor(Math.random() * products.length)
                ];

            carts.push({
                user: users[i + j]._id,

                items: [
                    {
                        product: randomProduct._id,

                        quantity: faker.number.int({
                            min: 1,
                            max: 5,
                        }),

                        price: randomProduct.price,
                    },
                ],
            });
        }

        await Cart.insertMany(carts);

        console.log(
            `Carts Inserted: ${Math.min(
                i + BATCH_SIZE,
                users.length
            )}`
        );
    }

    console.log("Carts Seeded");
}

async function seed() {
    try {
        await connectDB();

        console.log("Clearing existing data...");
        await User.deleteMany({});
        await Product.deleteMany({});
        await Cart.deleteMany({});
        console.log("Existing data cleared.");

        await seedUsers();

        await seedProducts();

        await seedCarts();

        console.log("Seeding Completed");

        process.exit(0);
    } catch (error) {
        console.error(error);

        process.exit(1);
    }
}

seed();