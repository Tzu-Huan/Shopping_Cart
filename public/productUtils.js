
let products = [];
let cartItems = []; // Array to hold cart items
// fetch data from DB and execute it, next function will display the data
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

// // Event listener for search button will execute previous function: displayProducts(productArray)
// searchBtn.addEventListener("click", () => {
//   console.log('search button clicked!')
//   const searchTerm = searchInput.value.toLowerCase();
//   const filteredProducts = products.filter(product => 
//     product.name.toLowerCase().includes(searchTerm) || 
//     product.description.toLowerCase().includes(searchTerm)
//   );
//   console.log(filteredProducts);
//   displayProducts(filteredProducts);
// });


// Function to display products in the productList that user search for
function displayProducts(productArray) {
  searchProduct.innerHTML = "";

  productArray.forEach(product => {
    //(previous code for displaying product details)
    const productDiv = document.createElement("div"); // Create product div
    productDiv.classList.add("product");
    productDiv.innerHTML = `
      <h3>${product.name}</h3>
      <p>${product.description}</p>
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
    console.log(searchProduct);
  });
}
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
export {products, fetchProducts, displayProducts, displayProductList, addToCart, cartItems };