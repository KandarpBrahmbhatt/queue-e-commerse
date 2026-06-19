import mongoose from 'mongoose';
import Product from './models/product.model';

mongoose.connect('mongodb://localhost:27017/-e-com')
  .then(async () => {
    const products = await Product.find().lean();
    console.log("ALL PRODUCTS IN DB:");
    console.log(JSON.stringify(products, null, 2));
    await mongoose.disconnect();
  })
  .catch(async (err) => {
    console.error(err);
    await mongoose.disconnect();
  });
