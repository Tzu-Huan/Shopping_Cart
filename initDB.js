const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// Connect to the MongoDB database
mongoose.connect('mongodb://127.0.0.1:27017/shopping_cart', {  // note for my self: localhost:27017 failed, until I changed to 127.0.0.1
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

// Create a model for the products
const Product = mongoose.model('Product', productSchema);

// Read and parse the JSON data
const productsData = fs.readFileSync(path.join(__dirname, 'products.json'), 'utf8');
const sampleProducts = JSON.parse(productsData);

// Insert sample products into the database
Product.insertMany(sampleProducts)
  .then(() => {
    console.log('Sample products inserted successfully.');
    mongoose.connection.close();
  })
  .catch(error => {
    console.error('Error inserting sample products:', error);
    mongoose.connection.close();
  });
