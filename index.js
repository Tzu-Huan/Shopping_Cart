const express = require('express');
const mongoose = require('mongoose');
const { Product, insertSampleProducts } = require('./initDB.js'); // Import the Product model and insertSampleProducts function
// ... other imports and app setup ...

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


app.listen(3000, () => {
    console.log('http://localhost:3000 Server running on port 3000');
});
