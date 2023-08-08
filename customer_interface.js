const productList = document.getElementById("productList");
const shoppingCart = document.getElementById("shoppingCart");
const orderHistory = document.getElementById("orderHistory");
const searchInput = document.getElementById("searchInput");
const searchBtn = document.getElementById("searchBtn");
const submitOrderBtn = document.getElementById("submitOrderBtn");

let cart = [];

// Function to fetch and display products
function fetchProducts() {
  // Use fetch to get product data from your API
  // Parse the response and populate the productList
}

// Function to display products in the productList
function displayProducts(products) {
  // Create HTML elements for each product and append to productList
}

// Function to add a product to the cart
function addToCart(product) {
  // Check if product is already in the cart
  // If yes, update quantity; if no, add to cart
}

// Function to remove a product from the cart
function removeFromCart(productId) {
  // Remove the product from the cart array
}

// Function to update cart UI
function updateCartUI() {
  // Clear shoppingCart and display cart items
}

// Event listener for search button
searchBtn.addEventListener("click", () => {
  const searchTerm = searchInput.value;
  // Call a function to search products based on searchTerm
});

// Event listener for adding product to cart
productList.addEventListener("click", (event) => {
  const target = event.target;
  if (target.classList.contains("add-to-cart")) {
    const productId = target.getAttribute("data-id");
    const product = getProductById(productId); // Implement this function to get product details
    addToCart(product);
    updateCartUI();
  }
});

// Event listener for removing product from cart
shoppingCart.addEventListener("click", (event) => {
  const target = event.target;
  if (target.classList.contains("remove-from-cart")) {
    const productId = target.getAttribute("data-id");
    removeFromCart(productId);
    updateCartUI();
  }
});

// Event listener for submitting order
submitOrderBtn.addEventListener("click", () => {
  // Implement the order submission logic
  // Update stock quantities and order history
});
