import swaggerJsdoc from "swagger-jsdoc";

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Queue E-Commerce API",
      version: "1.0.0",
      description: "Node.js + Express + MongoDB APIs",
    },
    servers: [
      {
        url: "http://localhost:5000",
      },
    ],
  },
 apis: [
  "./swagger/*.ts",
],
};

export const swaggerSpec = swaggerJsdoc(options);