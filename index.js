const express = require('express');
const mongoose = require('mongoose');
const { Product, insertSampleProducts, Order, Customer, insertSampleCustomers, getAllCustomers } = require('./initDB.js'); // Import the Product model and insertSampleProducts function
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
    await insertSampleCustomers();


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


// Route to fetch customers (in index.html)
app.get('/fetch-customers', async (req, res) => {
  try {
    const customers = await getAllCustomers();
    res.json(customers);
  } catch (error) {
    console.error('Error fetching customers:', error);
    res.status(500).json({ error: 'Failed to fetch customers' });
  }
});


app.get('/customer_interface.html', async(req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'customer_interface.html'));
  });


// Custom route for handling the Start Shopping form submission
app.post('/start-shopping', (req, res) => {
    const selectedCustomer = req.body.customer;
    
    if (selectedCustomer) {
      // Redirect to the customer interface with the selected customer as a query parameter
      // use it in getCustomerFromQuery() line 188 in customer_interface.js
      res.redirect(`/customer_interface.html?customer=${selectedCustomer}`);
    } else {
      res.status(400).send("No customer selected.");
    }
  });



const convert = require('xml-js');
// function generateXML(products) {
//   const xmlData = {
//     products: [
//       {
//         // type: 'element',
//         // name: 'products',
//         products: products.map(product => (
//           [
//             { _id: product._id.toString() } ,
//             {name: product.name },
//             { description: product.description },
//             { price: product.price },
//             { stockQuantity: product.stockQuantity },
//           ]
//         ))
//       }
//     ]
//   };

//   const xmlOptions = { compact: true, spaces: 2 };
//   return convert.js2xml(xmlData, xmlOptions);
// }


// create XML from Json
function generateXML(products) {
  const xmlData = {
    products: products.map(product => ({
      _id: { _text: product._id.toString() },
      name: { _text: product.name },
      description: { _text: product.description },
      price: { _text: product.price },
      stockQuantity: { _text: product.stockQuantity }
    }))
  };

  const xmlOptions = { compact: true, spaces: 2 };
  return convert.js2xml(xmlData, xmlOptions);
}


//REST APIs
// Route for fetching a list of all products
app.get('/products', async (req, res) => {
	const result = req.params;
  console.log(result);
  try {
    const products = await Product.find();
    res.format({
      'application/json': () => res.json(products),
      'application/xml': () => {
        const xmlResponse = generateXML(products);
        res.type('application/xml').send(xmlResponse);
      },
      'text/html': () => res.json(products),
      default: () => res.status(406).send('Not Acceptable')
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

//REST APIs
// Product matching a specified name
app.get('/products/:productName', async (req, res) => {
  const productName = req.params.productName;
  
  try {
    const products = await Product.find({ name: productName });
    res.format({
      'application/json': () => res.json(products),
      'application/xml': () => {
        const xmlResponse = generateXML(products);
        res.type('application/xml').send(xmlResponse);
      },
      'text/html': () => res.json(products),
      default: () => res.status(406).send('Not Acceptable')
    });
  } catch (error) {
    console.error(`Error fetching products matching name ${productName}:`, error);
    res.status(500).json({ error: `Failed to fetch products matching name ${productName}` });
  }
});

// Route for fetching products within a specified price range
app.get('/products/price/:low/:high', async (req, res) => {
  const lowPrice = parseFloat(req.params.low);
  const highPrice = parseFloat(req.params.high);

  try {
    const products = await Product.find({ price: { $gte: lowPrice, $lte: highPrice } });
    res.format({
      'application/json': () => res.json(products),
      'application/xml': () => {
        const xmlResponse = generateXML(products);
        res.type('application/xml').send(xmlResponse);
      },
      'text/html': () => res.json(products),
      default: () => res.status(406).send('Not Acceptable')
    });
  } catch (error) {
    console.error(`Error fetching products within price range ${lowPrice} - ${highPrice}:`, error);
    res.status(500).json({ error: `Failed to fetch products within price range` });
  }
});

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
  console.log('body', req.body);
  let cartItems = req.body.cartItems; // Get the cart items from the request body
  let customerId = req.body.customer;

  
  if (!Array.isArray(cartItems) || cartItems.length === 0) {
    return res.status(400).send("Invalid cart items.");
  }

  try {
    // Calculate the total price of the order
    const totalPrice = cartItems.reduce((total, item) => total + item.product.price * item.quantity, 0);  //The initial value of the accumulator is 0.

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





// fetch order history for a specific customer
app.get('/order-history', async (req, res) => {
  const customerId = req.query.customerId; // Get customerId from query
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

  const addProduct = new Product({
    name: newProduct.name,
    description: newProduct.description,
    price: newProduct.price,
    stockQuantity: newProduct.stockQuantity,
  });
  console.log('New product:', addProduct);

  await addProduct.save();

  res.status(200).send("Product add successfully.");

});

////
// Route for deleting a product
app.delete('/delete/:productId', async (req, res) => {
  const productId = req.params.productId; // Get the product ID from the route parameter

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


// Route for updating a product
app.put('/update/:productId', async (req, res) => {
  const productId = req.params.productId;
  const updatedProduct = req.body;

  try {
    const existingProduct = await Product.findByIdAndUpdate(productId, updatedProduct, { new: true });

    if (existingProduct) {
      console.log(`Product with ID ${productId} updated.`);
      res.status(200).send(`Product with ID ${productId} updated.`);
    } else {
      console.error(`Product with ID ${productId} not found.`);
      res.status(404).send(`Product with ID ${productId} not found.`);
    }
  } catch (error) {
    console.error(`Error updating product with ID ${productId}:`, error);
    res.status(500).send(`Failed to update product with ID ${productId}.`);
  }
});


// Route for updating the quantity of a product in an order
app.put('/update-quantity/:orderId/:productId', async (req, res) => {

  const orderId = req.params.orderId;
  const productId = req.params.productId;
  const newQuantity = parseInt(req.body.newQuantity);

  try {
    // Find the order by its ID
    const order = await Order.findById(orderId);
    
    // Find the product within the order's products array
    const productIndex = order.products.findIndex(element => element.product.toString() == productId);
    
    if (productIndex !== -1) {
        subract = newQuantity - order.products[productIndex].quantity;
        order.products[productIndex].quantity = newQuantity;  // new quantity of order

        const product = await Product.findById(productId);
        console.log(product);

        if (subract > product.stockQuantity) {
          return res.status(400).send(`Requested quantity exceeds available stock for product ${product.name}.`);
        }
        
        // Update the order with the new product quantity
        // check increase or decrease
        if(subract >= 0){  // order increase
          product.stockQuantity -= subract;  // then decrease stock
          await product.save();
          await order.save();
        }else{
          product.stockQuantity += subract;
          await product.save();
          await order.save();
        }

        
        res.status(200).send(`Quantity of product with ID ${productId} in order with ID ${orderId} updated.`);
    } else {
        console.log('error');
        res.status(404).send(`Product with ID ${productId} not found in order with ID ${orderId}.`);
    }
} catch (error) {
    console.error(`Error updating quantity for product ${productId} in order ${orderId}:`, error);
    res.status(500).send(`Requested quantity exceeds available stock for product ${productId} in order ${orderId}.`);
}

 });

// Route for deleting a product from an order
app.delete('/delete-product/:orderId/:productId', async (req, res) => {
  const orderId = req.params.orderId;
  const productId = req.params.productId;
  
  try {
    // Find the order by its ID
    const order = await Order.findById(orderId);
    
    // Find the product within the order's products array
    const productIndex = order.products.findIndex(element => element.product.toString() == productId);
    
    console.log(productIndex);

    
    if (productIndex !== -1) {
        deleteQuantity = order.products[productIndex].quantity;
        // order.products[productIndex].quantity = 0;  
        // new quantity of order
        console.log(deleteQuantity);
        const product = await Product.findById(productId);
        console.log(product);


        product.stockQuantity += deleteQuantity;
        order.products.splice(productIndex, 1); // Remove the product from the array
        // If there are no products left in the order, delete the entire order (last product in the order)
        if (order.products.length === 0) {
          await Order.deleteOne({ _id: orderId });
          
          res.status(200).send(`Order with ID ${orderId} deleted successfully.`);
        } else {
          
          await product.save();
          await order.save();
          res.status(200).send(`${productId} in order with ID ${orderId} deleted.`);
        }

    } else {
        console.log('error');
        res.status(404).send(`Product with ID ${productId} not found in order with ID ${orderId}.`);
    }
} catch (error) {
    console.error(`Error updating quantity for product ${productId} in order ${orderId}:`, error);
    res.status(500).send(`delete failed: ${productId} in order ${orderId}.`);
}

});

// Route for deleting an order (whole order)
app.delete('/delete-order/:orderId', async (req, res) => {
  const orderId = req.params.orderId;
  console.log(orderId);
  try {
    // Find the order by its ID
    const order = await Order.findById(orderId);
    console.log(order);
    if (!order) {
      return res.status(404).send(`Order with ID ${orderId} not found.`);
    }

    // Restore the product quantities that were previously deducted from stock
    for (const productItem of order.products) {
      const product = await Product.findById(productItem.product);
      if (product) {
        product.stockQuantity += productItem.quantity;
        await product.save();
      }
    }

    // Delete the order from the database
    await Order.deleteOne({ _id: orderId }); // Use .deleteOne() to delete the order

    res.status(200).send(`Order with ID ${orderId} deleted successfully.`);
  } catch (error) {
    console.error(`Error deleting order with ID ${orderId}:`, error);
    res.status(500).send(`Error deleting order with ID ${orderId}.`);
  }
});


app.listen(3000, () => {
    console.log('http://localhost:3000 Server running on port 3000');
});
