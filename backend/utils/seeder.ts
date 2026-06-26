import mongoose from "mongoose";
import dotenv from "dotenv";
import { faker } from "@faker-js/faker";

import User from "../models/user.model";
import Product from "../models/product.model";
import Order from "../models/order.model";
import Review from "../models/review.model";
import { Cart } from "../models/card.model";
import Address from "../models/address.model";
import Role from "../models/role.model";
import Permission from "../models/permission.model";

dotenv.config();

const MONGO_URI =
  process.env.MONGO_URL || process.env.MONGO_URI;

const BATCH_SIZE = 25000; // IMPORTANT (safe for 1M)
const TOTAL = 1000000;

async function connectDB() {
  await mongoose.connect(MONGO_URI!);
  console.log("Mongo Connected");
}

async function seedRolesAndPermissions() {
  console.log("Seeding Roles and Permissions...");
  await Role.deleteMany({});
  await Permission.deleteMany({});

  const permissionsData = [
    { name: "CREATE_PRODUCT" },
    { name: "READ_PRODUCT" },
    { name: "UPDATE_PRODUCT" },
    { name: "DELETE_PRODUCT" }
  ];
  const permissions = await Permission.insertMany(permissionsData);
  const permMap = new Map(permissions.map(p => [p.name, p._id]));

  const rolesData = [
    {
      name: "CUSTOMER",
      permissions: [permMap.get("READ_PRODUCT")]
    },
    {
      name: "SELLER",
      permissions: [
        permMap.get("READ_PRODUCT"),
        permMap.get("CREATE_PRODUCT"),
        permMap.get("UPDATE_PRODUCT")
      ]
    },
    {
      name: "ADMIN",
      permissions: [
        permMap.get("READ_PRODUCT"),
        permMap.get("CREATE_PRODUCT"),
        permMap.get("UPDATE_PRODUCT"),
        permMap.get("DELETE_PRODUCT")
      ]
    }
  ];

  await Role.insertMany(rolesData);
  console.log("Roles and Permissions seeded successfully");
}

async function seedUsers() {
  console.log("Seeding Users...");

  await User.deleteMany({});

  let customerRole = await Role.findOne({ name: "CUSTOMER" });
  if (!customerRole) {
    await seedRolesAndPermissions();
    customerRole = await Role.findOne({ name: "CUSTOMER" });
  }
  const customerRoleId = customerRole ? customerRole._id : null;

  const password = "Password@123";

  for (let i = 0; i < TOTAL; i += BATCH_SIZE) {
    const users = [];

    const limit = Math.min(BATCH_SIZE, TOTAL - i);

    for (let j = 0; j < limit; j++) {
      users.push({
        name: faker.person.fullName(),

        email: `user_${i + j}_${Date.now()}@mail.com`,

        password,

        isOtpVerifed: true,

        role: customerRoleId
      });
    }

    await User.insertMany(users, {
      ordered: true,
    });

    console.log(`Users: ${i + limit}/${TOTAL}`);
  }
}


async function seedProducts() {
  console.log("Seeding Products...");

  await Product.deleteMany({});

  for (let i = 0; i < 500000; i += BATCH_SIZE) {
    const products = [];

    const limit = Math.min(BATCH_SIZE, 500000 - i);

    for (let j = 0; j < limit; j++) {
      const name = faker.commerce.productName();

      products.push({
        name,
        slug: faker.helpers.slugify(name) + Date.now() + j,
        description: faker.commerce.productDescription(),
        shortDescription: faker.commerce.productDescription(),
        sku: faker.string.alphanumeric(10) + Date.now(),
        price: faker.number.int({ min: 100, max: 10000 }),
        discountPrice: faker.number.int({ min: 50, max: 5000 }),
        stock: faker.number.int({ min: 1, max: 1000 }),
        sold: faker.number.int({ min: 0, max: 500 }),
        category: faker.commerce.department(),
        images: [faker.image.url()],
        status: "ACTIVE",
        ratingsAverage: 0,
        ratingsQuantity: 0,
      });
    }

    await Product.insertMany(products);

    console.log(`Products: ${i + limit}/500000`);
  }
}



async function seedAddresses() {
  console.log("Seeding Addresses...");

  await Address.deleteMany({});

  const users = await User.find().select("_id").lean();

  if (users.length === 0) {
    console.log(" No users found in database. Please seed Users first!");
    return;
  }

  const addresses = [];

  for (let i = 0; i < users.length; i++) {
    addresses.push({
      userId: users[i]._id,
      fullName: faker.person.fullName(),
      mobile: `9${faker.string.numeric(9)}`,
      addressLine1: faker.location.streetAddress(),
      addressLine2: faker.location.secondaryAddress(),
      city: faker.location.city(),
      state: faker.location.state(),
      pincode: faker.string.numeric(6),
      country: "India",
      isDefault: i === 0
    });

    if (addresses.length === BATCH_SIZE) {
      await Address.insertMany(addresses);
      console.log(`${BATCH_SIZE} addresses inserted`);
      addresses.length = 0;
    }
  }

  if (addresses.length) {
    await Address.insertMany(addresses);
    console.log(`${addresses.length} addresses inserted`);
  }

  console.log("Address seeding completed");
}

async function seedCart(){
  console.log("Seeding Cart...");

  await Cart.deleteMany({});

  const users = await User.find().select("_id").lean();
  const products = await Product.find().select("_id price").lean();

  if (users.length === 0) {
    console.log(" No users found in database. Please seed Users first!");
    return;
  }
  if (products.length === 0) {
    console.log(" No products found in database. Please seed Products first!");
    return;
  }

  const carts = [];

  for (const user of users) {
    const items = [];
    const randomProducts = Math.floor(Math.random() * 5) + 1;

    for (let i = 0; i < randomProducts; i++) {
      const product = products[Math.floor(Math.random() * products.length)];

      items.push({
        product: product._id,
        quantity: Math.floor(Math.random() * 5) + 1,
        price: product.price
      });
    }

    const totalAmount = items.reduce(
      (sum, item) => sum + (item.price * item.quantity),
      0
    );

    carts.push({
      user: user._id,
      items,
      totalAmount
    });

    if (carts.length === BATCH_SIZE) {
      await Cart.insertMany(carts);
      console.log(`${BATCH_SIZE} carts inserted`);
      carts.length = 0;
    }
  }

  if (carts.length) {
    await Cart.insertMany(carts);
    console.log(`${carts.length} carts inserted`);
  }

  console.log("Cart seeded successfully");
}

async function seedOrders() {
  console.log("Seeding Orders...");

  await Order.deleteMany({});

  const users = await User.find().select("_id").lean();
  const products = await Product.find().select("_id price name").lean();

  if (users.length === 0) {
    console.log(" No users found in database. Please seed Users first!");
    return;
  }
  if (products.length === 0) {
    console.log(" No products found in database. Please seed Products first!");
    return;
  }

  for (let i = 0; i < 300000; i += BATCH_SIZE) {
    const orders = [];
    const limit = Math.min(BATCH_SIZE, 300000 - i);

    for (let j = 0; j < limit; j++) {
      const user = users[Math.floor(Math.random() * users.length)];
      const product = products[Math.floor(Math.random() * products.length)];

      orders.push({
        user: user._id,
        orderNumber: "ORD-" + Date.now() + i + j,

        items: [
          {
            product: product._id,
            name: product.name,
            image: faker.image.url(),
            quantity: 1,
            price: product.price,
            totalPrice: product.price,
          },
        ],

        shippingAddress: {
          fullName: faker.person.fullName(),
          phoneNumber: faker.string.numeric(10),
          addressLine1: faker.location.streetAddress(),
          city: faker.location.city(),
          state: faker.location.state(),
          postalCode: faker.location.zipCode(),
          country: "India",
        },

        paymentMethod: "COD",
        paymentStatus: "PAID",
        orderStatus: "DELIVERD",

        subtotal: product.price,
        totalAmount: product.price,
        taxAmount: 0,
        shippingAmount: 0,
        discountAmount: 0,
      });
    }

    await Order.insertMany(orders);
    console.log(`Orders: ${i + limit}/300000`);
  }
} 

async function seedReviews() {
  console.log("Seeding Reviews...");

  await Review.deleteMany({});

  const users = await User.find().select("_id").lean();
  const products = await Product.find().select("_id").lean();

  if (users.length === 0) {
    console.log("No users found in database. Please seed Users first!");
    return;
  }
  if (products.length === 0) {
    console.log(" No products found in database. Please seed Products first!");
    return;
  }

  const reviews = [];

  for (let i = 0; i < 200000; i++) {
    const user = users[Math.floor(Math.random() * users.length)];
    const product = products[Math.floor(Math.random() * products.length)];

    reviews.push({
      userId: user._id,
      productId: product._id,
      rating: faker.number.int({ min: 1, max: 5 }),
      comment: faker.commerce.productDescription(),
    });

    if (reviews.length === BATCH_SIZE) {
      await Review.insertMany(reviews, { ordered: false });
      reviews.length = 0;
    }
  }

  if (reviews.length) {
    await Review.insertMany(reviews);
  }
}

// async function run() {
//   try {
//     await connectDB();

//     await seedUsers();
//     await seedProducts();
//     await seedAddresses();
//     await seedCart();
//     await seedOrders();
//     await seedReviews();

//     console.log(" 1M DATA SEEDED SUCCESSFULLY");

//     process.exit(0);
//   } catch (err) {
//     console.error(err);
//     process.exit(1);
//   }
// }

// run();


import readline from "readline";


const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});


function askQuestion(question:string):Promise<string>{

  return new Promise((resolve)=>{
    rl.question(question,(answer)=>{
      resolve(answer);
    });
  });

}



async function runSeeder(){

 try{

    await connectDB();


    console.log(`
=============================
      SELECT SEEDER
=============================

1. Users
2. Products
3. Addresses
4. Cart
5. Orders
6. Reviews
7. All

=============================
`);


    const choice = await askQuestion(
      "Enter your choice: "
    );



    // switch(choice){


    //   case "1":
    //     await seedUsers();
    //     break;


    //   case "2":
    //     await seedProducts();
    //     break;


    //   case "3":
    //     await seedAddresses();
    //     break;


    //   case "4":
    //     await seedCart();
    //     break;


    //   case "5":
    //     await seedOrders();
    //     break;


    //   case "6":
    //     await seedReviews();
    //     break;


    //   case "7":

    //     await seedUsers();
    //     await seedProducts();
    //     await seedAddresses();
    //     await seedCart();
    //     await seedOrders();
    //     await seedReviews();

    //     break;


    //   default:

    //     console.log("Invalid Choice");

    // }

switch(choice.toLowerCase()){


case "1":
case "1.users":
case "users":
    await seedUsers();
    break;


case "2":
case "2.products":
case "products":
    await seedProducts();
    break;


case "3":
case "3.addresses":
case "addresses":
    await seedAddresses();
    break;


case "4":
case "4.cart":
case "cart":
    await seedCart();
    break;


case "5":
case "5.orders":
case "orders":
    await seedOrders();
    break;


case "6":
case "6.reviews":
case "reviews":
    await seedReviews();
    break;


case "7":
case "7.all":
case "all":

    await seedUsers();
    await seedProducts();
    await seedAddresses();
    await seedCart();
    await seedOrders();
    await seedReviews();

    break;


default:
    console.log("Invalid Choice");

}
    console.log(
      "Seeder completed successfully"
    );


    rl.close();

    process.exit(0);


 }catch(error){

    console.log(error);

    rl.close();

    process.exit(1);

 }

}


runSeeder();