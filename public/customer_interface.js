// import { products, fetchProducts, displayProducts, displayProductList, addToCart } from './productUtils.js';

let products = [];
fetchProducts();
// // // fetch data from DB and execute it, next function will display the data
async function fetchProducts() {
  try {
    const response = await fetch('/products'); // Fetch products from the server
    products = await response.json();
    displayProductList();  // display all products before seaerch
  } catch (error) {
    console.error('Error fetching product list:', error);
  }
}
fetchProducts();
// display all products (name only, no details)
function displayProductList() {
  try {
    const productList = document.getElementById('productList');
    productList.innerHTML = ''; // Clear any previous entries

    products.forEach(product => {
      const listItem = document.createElement('li');
      listItem.innerHTML = `
        <strong>${product.name}</strong><br>
      `;
      productList.appendChild(listItem);
    });
  } catch (error) {
    console.error('Error fetching product list:', error);
  }
}

// Event listener for search button will execute previous function: displayProducts(productArray)
searchBtn.addEventListener("click", () => {
  console.log('search button clicked!!!!!')
  const searchTerm = searchInput.value.toLowerCase();
  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(searchTerm) || 
    product.description.toLowerCase().includes(searchTerm)
  );
  console.log(filteredProducts);
  displayProducts(filteredProducts);
});


// // Function to display products in the productList that user search for
function displayProducts(productArray) {
  searchProduct.innerHTML = "";

  productArray.forEach(product => {
    //(previous code for displaying product details)
    const productDiv = document.createElement("div"); // Create product div
    productDiv.classList.add("product");
    productDiv.innerHTML = `
      <h3>${product.name} id: ${product._id}</h3>
      <p>Description: ${product.description}</p>
      <p>Price: $${product.price.toFixed(2)}</p>
      <p>Stock Quantity: ${product.stockQuantity}</p>
      <label for="quantity${product.id}">Quantity:</label>
      <input type="number" id="quantity${product.id}" min="1" max="${product.stockQuantity}" value="1">
      <button class="addToCartButton" data-id="${product.id}">Add to Cart</button>
    `;
    // Add event listener to the "Add to Cart" button
    const addToCartButton = productDiv.querySelector(".addToCartButton");
    addToCartButton.addEventListener("click", () => {
      
      const quantityInput = productDiv.querySelector(`#quantity${product.id}`);
      const quantity = parseInt(quantityInput.value, 10);
      if (quantity > 0 && quantity <= product.stockQuantity) {
        addToCart(product, quantity); // Call the addToCart function
      } else {
        alert("Invalid quantity or insufficient stock.");
      }
    });

    searchProduct.appendChild(productDiv);
  });
}


// shopping cart function

let cartItems = []; // Array to hold cart items

function updateCartDisplay() {
  const cartList = document.getElementById('shoppingCart');
  const cartTotalElement = document.getElementById('cartTotal');

  cartList.innerHTML = ''; // Clear previous cart items
  
  let cartTotal = 0;

  cartItems.forEach(cartItem => {
    const cartItemLi = document.createElement('li');
    cartItemLi.innerHTML = `
      <strong>${cartItem.product.name}</strong>
      <br>
      Quantity: ${cartItem.quantity}
      <br>
      Price: $${(cartItem.product.price * cartItem.quantity).toFixed(2)}
      <button class="remove-from-cart" data-id="${cartItem.product._id}">Remove</button>
      <button class="quantity-decrease" data-id="${cartItem.product._id}">-</button>
      <button class="quantity-increase" data-id="${cartItem.product._id}">+</button>
      <hr>
    `;
    cartList.appendChild(cartItemLi);

    cartTotal += cartItem.product.price * cartItem.quantity;
  });

  cartTotalElement.textContent = cartTotal.toFixed(2);

  // Add event listeners for remove buttons
  const removeButtons = document.querySelectorAll('.remove-from-cart');
  removeButtons.forEach(button => {
    button.addEventListener('click', () => {
      const productId = button.getAttribute('data-id');
      removeFromCart(productId);
    });
  });

  // Add event listeners for quantity adjustment buttons
  const quantityDecreaseButtons = document.querySelectorAll('.quantity-decrease');
  quantityDecreaseButtons.forEach(button => {
    button.addEventListener('click', () => {
      console.log('decrease clicked');
      const productId = button.getAttribute('data-id');
      adjustCartItemQuantity(productId, -1);
    });
  });

  const quantityIncreaseButtons = document.querySelectorAll('.quantity-increase');
  quantityIncreaseButtons.forEach(button => {
    button.addEventListener('click', () => {
      const productId = button.getAttribute('data-id');
      adjustCartItemQuantity(productId, 1);
    });
  });
}
//////////////////////////////////

function addToCart(product, quantity) {
  console.log(product,quantity);
  const existingCartItem = cartItems.find(item => item.product._id === product._id);
  
  if (existingCartItem) {
    const newQuantity = existingCartItem.quantity + quantity;
    if (newQuantity <= product.stockQuantity) {
      existingCartItem.quantity = newQuantity;
      updateCartDisplay();
    } else {
      alert("Insufficient stock. Cannot add more than available quantity.");
    }
  } else {
    if (quantity <= product.stockQuantity) {
      cartItems.push({ product, quantity });
      updateCartDisplay();
    } else {
      alert("Insufficient stock. Cannot add more than available quantity.");
    }
  }
}

function removeFromCart(productId) {
  cartItems = cartItems.filter(item => item.product._id !== productId);
  updateCartDisplay();
}
function adjustCartItemQuantity(productId, quantityChange) {
  console.log(productId,quantityChange);
  const cartItem = cartItems.find(item => item.product._id === productId);

  if (cartItem) {
    const newQuantity = cartItem.quantity + quantityChange;

    if (newQuantity > 0 && newQuantity <= cartItem.product.stockQuantity) {
      cartItem.quantity = newQuantity;
      updateCartDisplay();
    } else {
      alert("Invalid quantity or insufficient stock.");
    }
  }
}

// Assuming the URL is like "/customer_interface.html?customer=123"
function getCustomerFromQuery() {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('customer'); // Returns the value of the "customer" query parameter
}

// Event listener for submitting order
submitOrderBtn.addEventListener("click", async () => {
  if (cartItems.length === 0) {
    alert("Your cart is empty. Add items before submitting an order.");
    return;
  }

  try {

    const customer = getCustomerFromQuery(); // Get customer ID from query or session
    console.log(customer);
    console.log('still good 1');
    // let orderItems = cartItems.map(cartItem => ({
    //   product: cartItem.product.name, // Assuming product._id is the ID field of the product
    //   quantity: cartItem.quantity
    // }));
    // console.log('orderItems:', orderItems);
    // let order = {
    //   customer: customer,
    //   orderItems: orderItems
    // };
    const response = await fetch('/submit-order', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      // body: JSON.stringify({ customerId: customer, cartItems: cartItems }),
      body: JSON.stringify({ cartItems, customer }), // Send both cartItems and customerId
    });
    console.log('response');
    console.log(response);

    if (response.ok) {
      // Successfully submitted order, clear cart and update display
      cartItems = [];
      updateCartDisplay();
      alert("Order submitted successfully!");
      location.reload();
    } else {
      alert("Failed to submit order. Please try again.");
    }

  } catch (error) {
    console.error("Error submitting order:", error);
    alert("An error occurred while submitting the order.");
  }
});



// Function to fetch and display order history
async function fetchOrderHistory(customerId) {
  try {
    const response = await fetch(`/order-history?customerId=${customerId}`);
    const orders = await response.json();

    // Display orders on the webpage
    const orderHistory = document.getElementById('orderHistory');
    orderHistory.innerHTML = '';

    orders.forEach(order => {
      const orderItem = document.createElement('li');
      orderItem.innerHTML = `
        <strong>Order Date:</strong> ${new Date(order.orderDate).toLocaleDateString()}<br>
        <strong>Total Amount:</strong> $${order.totalAmount.toFixed(2)}<br>
        <strong>Products:</strong><br>
        ${order.products.map(product => `${product.name} - Quantity: ${product.quantity}`).join('<br>')}
        <hr>
      `;
      orderHistory.appendChild(orderItem);
    });
  } catch (error) {
    console.error('Error fetching order history:', error);
  }
}

// Assuming the URL is like "/customer_interface.html?customer=123"
const customer = getCustomerFromQuery();
fetchOrderHistory(customer);



// // Add event listeners for quantity input changes
// const quantityInputs = document.querySelectorAll('[id^="quantity"]');
// quantityInputs.forEach(input => {
//   input.addEventListener('change', () => {
//     const productId = input.getAttribute('id').replace('quantity', '');
//     const quantity = parseInt(input.value, 10);
//     updateCartItemQuantity(productId, quantity);
//   });
// });

// // ...

// function updateCartItemQuantity(productId, newQuantity) {
//   const existingCartItem = cartItems.find(item => item.product._id === productId);
//   if (existingCartItem) {
//     existingCartItem.quantity = newQuantity;
//     updateCartDisplay();
//   }
// }

// function adjustCartItemQuantity(productId, adjustment) {
//   const existingCartItem = cartItems.find(item => item.product._id === productId);
//   if (existingCartItem) {
//     const newQuantity = existingCartItem.quantity + adjustment;
//     if (newQuantity > 0 && newQuantity <= existingCartItem.product.stockQuantity) {
//       existingCartItem.quantity = newQuantity;
//       updateCartDisplay();
//     }
//   }
// }



// ... (rest of the code)

// const productList = document.getElementById("productList");
// const shoppingCart = document.getElementById("shoppingCart");
// const orderHistory = document.getElementById("orderHistory");
// const searchInput = document.getElementById("searchInput");
// const searchBtn = document.getElementById("searchBtn");
// const submitOrderBtn = document.getElementById("submitOrderBtn");




// let cart = [];

// // Function to fetch and display products
// function fetchProducts() {
//   // Use fetch to get product data from your API
//   // Parse the response and populate the productList
// }

// // Function to display products in the productList
// function displayProducts(products) {
//   // Create HTML elements for each product and append to productList
// }

// // Function to add a product to the cart
// function addToCart(product) {
//   // Check if product is already in the cart
//   // If yes, update quantity; if no, add to cart
// }

// // Function to remove a product from the cart
// function removeFromCart(productId) {
//   // Remove the product from the cart array
// }

// // Function to update cart UI
// function updateCartUI() {
//   // Clear shoppingCart and display cart items
// }

// // Event listener for search button
// searchBtn.addEventListener("click", () => {
//   const searchTerm = searchInput.value;
//   // Call a function to search products based on searchTerm
// });

// // Event listener for adding product to cart
// productList.addEventListener("click", (event) => {
//   const target = event.target;
//   if (target.classList.contains("add-to-cart")) {
//     const productId = target.getAttribute("data-id");
//     const product = getProductById(productId); // Implement this function to get product details
//     addToCart(product);
//     updateCartUI();
//   }
// });

// // Event listener for removing product from cart
// shoppingCart.addEventListener("click", (event) => {
//   const target = event.target;
//   if (target.classList.contains("remove-from-cart")) {
//     const productId = target.getAttribute("data-id");
//     removeFromCart(productId);
//     updateCartUI();
//   }
// });

// // Event listener for submitting order
// submitOrderBtn.addEventListener("click", () => {
//   // Implement the order submission logic
//   // Update stock quantities and order history
// });
