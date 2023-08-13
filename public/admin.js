// import { fetchProducts, displayProducts, displayProductList, products } from './productUtils.js';

let products = [];
fetchProducts();

async function fetchProducts() {
    try {
      const response = await fetch('/products'); // Fetch products from the server
      products = await response.json();
      //displayProductList();  // display all products before seaerch
    } catch (error) {
      console.error('Error fetching product list:', error);
    }
  }
  fetchProducts();

searchBtn.addEventListener("click", () => {
    console.log('search button clicked!')
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
        <button class="updateProductButton" data-id="${product._id}">Update</button>
        <button class="deleteProductButton" data-id="${product._id}">Delete</button>
      `;

        // Event listener for updating a product
        const updateProductButton = productDiv.querySelector(".updateProductButton");
        updateProductButton.addEventListener("click", () => {
            // Implement the update logic here
            console.log(`Update product with ID: ${product._id}`);
            
        });
    
        // Event listener for deleting a product
        const deleteProductButton = productDiv.querySelector(".deleteProductButton");
        deleteProductButton.addEventListener("click", () => {

            console.log(`Delete product with ID: ${product._id}`);
            deleteProduct(product._id);
        });
      // Add event listener to the "Add to Cart" button
    //   const addToCartButton = productDiv.querySelector(".addToCartButton");
    //   addToCartButton.addEventListener("click", () => {
        
    //     const quantityInput = productDiv.querySelector(`#quantity${product.id}`);
    //     const quantity = parseInt(quantityInput.value, 10);
    //     if (quantity > 0 && quantity <= product.stockQuantity) {
    //       addToCart(product, quantity); // Call the addToCart function
    //     } else {
    //       alert("Invalid quantity or insufficient stock.");
    //     }
    //   });
  
      searchProduct.appendChild(productDiv);
    });
  }

// Function to delete a product
async function deleteProduct(productId) {
    try {
      const response = await fetch(`/delete/${productId}`, {
        method: "DELETE"
      });
      console.log('doing good');
      if (response.ok) {
        const successMessage = await response.text();
        alert(successMessage);
        // console.log(`Product with ID ${productId} deleted.`);
        // Update the UI by removing the deleted product element
        // productDiv.remove();
                // Refresh the product list to reflect changes
                fetchProducts();
                location.reload();
                // alert(`Product with ID ${productId} has been successfully deleted.`); // Success message alert
      } else {
        const errorMessage = await response.text(); // Get the error message from the response
        alert(errorMessage); // Display the error message in an alert
      }
    } catch (error) {
      console.error("Error deleting product:", error);
    }
  }

  
  

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
// Function to display products maintenance form
function displayProductsMaintenanceForm() {
    addProdcut.innerHTML = '';
  
    // Create form for adding new products
    const addProductForm = document.createElement('form');
    addProductForm.innerHTML = `
      <h3>Add New Product</h3>
      <label for="productName">Name:</label>
      <input type="text" id="productName" required>
      <label for="productDescription">Description:</label>
      <input type="text" id="productDescription" required>
      <label for="productPrice">Price:</label>
      <input type="number" id="productPrice" step="0.01" required>
      <label for="productStock">Stock Quantity:</label>
      <input type="number" id="productStock" min="0" required>
      <button type="button" id="addProductBtn">Add Product</button>
    `;
  
    // Event listener for adding a new product
    const addProductBtn = addProductForm.querySelector('#addProductBtn');
    addProductBtn.addEventListener('click', async () => {
      const productName = document.getElementById('productName').value;
      const productDescription = document.getElementById('productDescription').value;
      const productPrice = parseFloat(document.getElementById('productPrice').value);
      const productStock = parseInt(document.getElementById('productStock').value, 10);
  
      const newProduct = {
        name: productName,
        description: productDescription,
        price: productPrice,
        stockQuantity: productStock
      };

      
    try {
    // Make an API call to add the new product to the database
    const response = await fetch('/addproducts', {
        method: 'POST',
        headers: {
        'Content-Type': 'application/json',
        },
        body: JSON.stringify(newProduct),
    });
    console.log(response);
    if (response.ok) {
        // Refresh the product list to reflect changes
        fetchProducts();
        location.reload();
    } else {
        console.error('Failed to add new product to the database.');
    }
    } catch (error) {
    console.error('Error adding new product:', error);
    }
    //   // Add new product to the products array and update display
    //   products.push(newProduct);
    //   displayProductList();
    });
  
    // Append the add product form to the searchProduct element
    addProdcut.appendChild(addProductForm);
    

  
  
    // Display the existing products with update and delete buttons
    // products.forEach(product => {
    //   const productDiv = document.createElement("div");
    //   productDiv.classList.add("product");
    //   productDiv.innerHTML = `
    //     <h3>${product.name} id: ${product._id}</h3>
    //     <p>Description: ${product.description}</p>
    //     <p>Price: $${product.price.toFixed(2)}</p>
    //     <p>Stock Quantity: ${product.stockQuantity}</p>
    //     <button class="updateProductButton" data-id="${product._id}">Update</button>
    //     <button class="deleteProductButton" data-id="${product._id}">Delete</button>
    //   `;
    //   searchProduct.appendChild(productDiv);
    // });
  }
  
  // Call the displayProductsMaintenanceForm function
  displayProductsMaintenanceForm();
  