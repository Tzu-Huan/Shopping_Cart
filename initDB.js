const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// Connect to the MongoDB database
mongoose.connect('mongodb://127.0.0.1:27017/shopping_cart', {  // note for myself: localhost:27017 failed, until I changed to 127.0.0.1
  useNewUrlParser: true,
  useUnifiedTopology: true,
});



// Create a schema for the products
const productSchema = new mongoose.Schema({
  name: String,
  description: String,
  price: Number,
  stockQuantity: Number,
});

// Create a model for the product
const Product = mongoose.model('Product', productSchema);

// Create a schema for the orders
// Create a schema for the orders
const orderSchema = new mongoose.Schema({
  // customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' },
  customer: { type: String, ref: 'Customer' },
  products: [{ 
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' }, // Change the type to ObjectId
    name: {type: String, required: true},
    quantity: { type: Number, required: true }
  }],
  totalAmount: { type: Number, required: true },
  orderDate: { type: Date, default: Date.now }
});


// Create a model for the Order
const Order = mongoose.model('Order', orderSchema);

const customerSchema = new mongoose.Schema({
  name: String,
});

const Customer = mongoose.model('Customer', customerSchema);


// Read and parse the JSON data (products)
const productsData = fs.readFileSync(path.join(__dirname, 'products.json'), 'utf8');
const sampleProducts = JSON.parse(productsData);

// Insert sample products into the database if it's empty
async function insertSampleProducts() {
  try {
    const count = await Product.countDocuments();
    if (count === 0) {
      await Product.insertMany(sampleProducts);
      console.log('Sample products inserted successfully.');
    } else {
      console.log('Database already contains products.');
    }
  } catch (error) {
    console.error('Error inserting sample products:', error);
  }
}

// Read and parse the JSON data (customers)
const customersData = fs.readFileSync(path.join(__dirname, 'customers.json'), 'utf8');
const sampleCustomers = JSON.parse(customersData);

// Insert sample customers into the database if it's empty
async function insertSampleCustomers() {
  try {
    const count = await Customer.countDocuments();
    if (count === 0) {
      await Customer.insertMany(sampleCustomers);
      console.log('Sample customers inserted successfully.');
    } else {
      console.log('Database already contains customers.');
    }
  } catch (error) {
    console.error('Error inserting sample customers:', error);
  }
}


// Fetch all customers from the database
async function getAllCustomers() {
  try {
    const customers = await Customer.find();
    return customers;
  } catch (error) {
    console.error('Error fetching customers:', error);
    return [];
  }
}

module.exports = { Product, insertSampleProducts, Order, Customer, insertSampleCustomers, getAllCustomers }; // Export the Product model and insertSampleProducts function

// // Insert sample products into the database
// Product.insertMany(sampleProducts)
//   .then(() => {
//     console.log('Sample products inserted successfully.');
//     // mongoose.connection.close();
//   })
//   .catch(error => {
//     console.error('Error inserting sample products:', error);
//     // mongoose.connection.close();
//   });


  
// module.exports = Product; // Export the Product model
// Product.find(function(err, products){
//   if(err){
//     console.log(err);
//   } else{
//     products.forEach(function(product){
//       console.log(product.name);
//     })
//   }
// })