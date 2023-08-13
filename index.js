const express = require('express');
const mongoose = require('mongoose');
const { Product, insertSampleProducts, Order, Customer } = require('./initDB.js'); // Import the Product model and insertSampleProducts function
// ... other imports and app setup ...

const { Types } = mongoose;
(async () => {
  try {
    await mongoose.connect('mongodb://127.0.0.1:27017/shopping_cart', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    // Call the insertSampleProducts function to insert sample products if the database is empty
    await insertSampleProducts();


  } catch (error) {
    console.error('Error connecting to the database:', error);
  }
})();



const path = require('path');
const bodyParser = require("body-parser");

var app = express();
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Set up middleware to serve static files from the "public" directory
// app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  // Instead of sending a string, send the actual content of index.html
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
  console.log(path.join(__dirname, 'public', 'index.html'));
});

app.get('/customer_interface.html', async(req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'customer_interface.html'));
  });


// Custom route for handling the Start Shopping form submission
app.post('/start-shopping', (req, res) => {
    const selectedCustomer = req.body.customer;
    if (selectedCustomer) {
      // Redirect to the customer interface with the selected customer as a query parameter
      res.redirect(`/customer_interface.html?customer=${selectedCustomer}`);
    } else {
      res.status(400).send("No customer selected.");
    }
  });

app.get('/products', async(req, res) => {
    const result = await Product.find();
    // res.send({"products": result});
    res.send(result);
})

// Define a function to get cart items for a specific customer
async function getCartItemsForCustomer(customerId) {
  try {
    const customer = await Customer.findById(customerId); // Assuming you have a Customer model
    if (customer) {
      return customer.cartItems; // Assuming the customer model has a "cartItems" field
    } else {
      return [];
    }
  } catch (error) {
    console.error('Error fetching cart items:', error);
    return [];
  }
}

// Custom route for handling order submission
app.post('/submit-order', async (req, res) => {
  let cartItems = req.body.cartItems; // Get the cart items from the request body
  let customerId = req.body.customer;
  console.log('NAMWE');
  
  if (!Array.isArray(cartItems) || cartItems.length === 0) {
    return res.status(400).send("Invalid cart items.");
  }

  try {
    // Calculate the total price of the order
    const totalPrice = cartItems.reduce((total, item) => total + item.product.price * item.quantity, 0);

    // Update product quantities and save the order
    for (const cartItem of cartItems) {
      const product = await Product.findById(cartItem.product._id);
      if (!product) {
        return res.status(404).send(`Product with ID ${cartItem.product._id} not found.`);
      }

      if (cartItem.quantity > product.stockQuantity) {
        return res.status(400).send(`Insufficient stock for product ${product.name}.`);
      }

      product.stockQuantity -= cartItem.quantity;
      await product.save();
    }

    console.log('Creating new order...');
    const newOrder = new Order({
      customer: customerId, // Cast the string to ObjectId
      products: cartItems.map(cartItem => ({
        product: new mongoose.Types.ObjectId(cartItem.product._id), // Cast the string to ObjectId
        name: cartItem.product.name,
        quantity: cartItem.quantity
      })),
      totalAmount: totalPrice
    });
    console.log('New Order:', newOrder);
    
    


    console.log('Saving new order...');
    await newOrder.save();


    res.status(200).send("Order submitted successfully.");
  } catch (error) {
    console.error("Error submitting order:", error);
    res.status(500).send("Failed to submit order. Please try again.");
  }
});





// API endpoint to fetch order history for a specific customer
app.get('/order-history', async (req, res) => {
  const customerId = req.query.customerId; // Get customerId from query parameters or session
  try {
    const orders = await Order.find({ customer: customerId }).populate('products.product');
    res.json(orders);
  } catch (error) {
    console.error('Error fetching order history:', error);
    res.status(500).json({ error: 'An error occurred while fetching order history.' });
  }
});


// Route for adding a new product
app.post('/addproducts', async (req, res) => {
  const newProduct = req.body; // New product data from client
  console.log('ger', newProduct);
  console.log('Creating new order...');

  const addProduct = new Product({
    
    name: newProduct.name,
    description: newProduct.description,
    price: newProduct.price,
    stockQuantity: newProduct.stockQuantity,
  });
  console.log('New product:', addProduct);

  await addProduct.save();

  res.status(200).send("Product add successfully.");
  // DB.push(newProduct); // Insert into the database (in-memory example)
  // res.status(201).json(newProduct); // Respond with the newly added product
});

// // Route for deleting a product
// app.delete('/delete/:productId', async (req, res) => {
//   const productId = req.params.productId; // Get the product ID from the route parameter

//   try {
//     const deletedProduct = await Product.findByIdAndDelete(productId);
//     if (deletedProduct) {
//       console.log(`Product with ID ${productId} deleted.`);
//       res.status(200).send(`Product with ID ${productId} deleted.`);
//     } else {
//       console.error(`Product with ID ${productId} not found.`);
//       res.status(404).send(`Product with ID ${productId} not found.`);
//     }
//   } catch (error) {
//     console.error(`Error deleting product with ID ${productId}:`, error);
//     res.status(500).send(`Failed to delete product with ID ${productId}.`);
//   }
// });


////
// Route for deleting a product
app.delete('/delete/:productId', async (req, res) => {
  const productId = req.params.productId; // Get the product ID from the route parameter
  console.log('go to here');
  try {
    
    // Check if the product is associated with any orders
    const productInOrders = await Order.findOne({ 'products.product': productId });
    if (productInOrders) {
      console.log(`Product with ID ${productId} is assigned to an order. Cannot delete.`);
      res.status(400).send(`Product with ID ${productId} is assigned to an order. Cannot delete!`);
      return;
    }

    const deletedProduct = await Product.findByIdAndDelete(productId);
    if (deletedProduct) {
      console.log(`Product with ID ${productId} deleted.`);
      res.status(200).send(`Product with ID ${productId} deleted!`);
    } else {
      console.error(`Product with ID ${productId} not found.`);
      res.status(404).send(`Product with ID ${productId} not found.`);
    }
  } catch (error) {
    console.error(`Error deleting product with ID ${productId}:`, error);
    res.status(500).send(`Failed to delete product with ID ${productId}.`);
  }
});


app.listen(3000, () => {
    console.log('http://localhost:3000 Server running on port 3000');
});
