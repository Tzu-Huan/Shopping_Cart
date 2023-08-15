
let products = [];


async function fetchProducts() {
    try {
      const response = await fetch('/products'); // Fetch products from the server
      products = await response.json();
      
      console.log('fetching products...');
      console.log(products);
      displayProductList();  // display all products before seaerch
    } catch (error) {
      console.error('Error fetching product list:', error);
    }
  }
fetchProducts();

// event listener of serach button
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
  
// // Function to display products in the productList that user SEARCH for (line 154 'displayProductList' is ALL prodcut)
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

        // Event listener for updating a product, a couple of input box will show 
        const updateProductButton = productDiv.querySelector(".updateProductButton");
        updateProductButton.addEventListener("click", () => {
            const updateForm = document.createElement("form");
            updateForm.innerHTML = `
            <label for="updateName">Name:</label>
            <input type="text" id="updateName" value="${product.name}" required>
            <label for="updateDescription">Description:</label>
            <input type="text" id="updateDescription" value="${product.description}" required>
            <label for="updatePrice">Price:</label>
            <input type="number" id="updatePrice" step="0.01" value="${product.price}" required>
            <label for="updateStock">Stock Quantity:</label>
            <input type="number" id="updateStock" min="0" value="${product.stockQuantity}" required>
            <button type="submit">Update Product</button>
        `;

        // Add an event listener to the update form submit button
            updateForm.addEventListener("submit", async (event) => {
            event.preventDefault();

            const updatedProduct = {
                name: document.getElementById("updateName").value,
                description: document.getElementById("updateDescription").value,
                price: parseFloat(document.getElementById("updatePrice").value),
                stockQuantity: parseInt(document.getElementById("updateStock").value, 10)
            };

            await updateProduct(product._id, updatedProduct);  // this fuction define in nex code block (about line 100)

            // Close the update form and refresh the product list
            updateForm.remove();
            fetchProducts();
            });

            // Append the update form to the productDiv
            productDiv.appendChild(updateForm);
            });
    
        // Event listener for deleting a product
        const deleteProductButton = productDiv.querySelector(".deleteProductButton");
        deleteProductButton.addEventListener("click", () => {

            console.log(`Delete product with ID: ${product._id}`);
            deleteProduct(product._id);
        });
  
        searchProduct.appendChild(productDiv);
    });
  }

// Function to update a product's information
async function updateProduct(productId, updatedProduct) {
    try {
      const response = await fetch(`/update/${productId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(updatedProduct)
      });
  
      if (response.ok) {
        console.log(`Product with ID ${productId} updated.`);
        // Refresh the product list to reflect changes
        fetchProducts();
        location.reload();  // refresh the webpage
        alert(`Product with ID ${productId} has been successfully updated.`);
      } else {
        const errorMessage = await response.text(); // Get the error message from the response
        alert(errorMessage); // Display the error message in an alert
      }
    } catch (error) {
      console.error("Error updating product:", error);
      alert("An error occurred while updating the product."); // Display a generic error message
    }
  }
  

// Function to delete a product
async function deleteProduct(productId) {
    try {
      const response = await fetch(`/delete/${productId}`, {
        method: "DELETE"
      });

      if (response.ok) {
        const successMessage = await response.text();
        alert(successMessage);
        fetchProducts();
        location.reload();

      } else {
        const errorMessage = await response.text(); // Get the error message from the response
        alert(errorMessage); // Display the error message in an alert
      }
    } catch (error) {
      console.error("Error deleting product:", error);
    }
  }

  
  
// display ALL prodcuts (line 32 'displayProducts' is SEARCH product)
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

// Function to display products maintenance form (to ADD new product)
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

    });
  
    // Append the add product form to the searchProduct element
    addProdcut.appendChild(addProductForm);

}
  
// Call the displayProductsMaintenanceForm function so when load in the page can show 
displayProductsMaintenanceForm();
  
// Function to fetch customers from the server
async function fetchCustomers() {
    try {
      const response = await fetch('/fetch-customers');
      if (response.ok) {
        const customers = await response.json();
        return customers;
      } else {
        console.error('Failed to fetch customers from the server.');
        return [];
      }
    } catch (error) {
      console.error('Error fetching customers:', error);
      return [];
    }
  }
  
 
 
 
// Function to display customers in the customer list
function displayCustomers(customers) {
    const customerList = document.getElementById('customerList');
  
    customers.forEach(customer => {
        const listItem = document.createElement('li');
        listItem.textContent = customer.name;
        listItem.classList.add('customer-item'); // Add a class for able to click
        listItem.setAttribute('data-customer-id', customer._id); // Set the data attribute
        listItem.setAttribute('data-customer-name', customer.name); // Set the data attribute for name
        customerList.appendChild(listItem);

    });


    const customerItems = document.querySelectorAll('.customer-item');
    console.log('look',customerItems);
    customerItems.forEach(customerItem => {
        customerItem.addEventListener('click', async () => {
            console.log('specific customer click');
            const customerId = customerItem.getAttribute('data-customer-id'); // Get the customer ID from the data attribute
            const customerName = customerItem.getAttribute('data-customer-name'); // Get the customer name from the data attribute

            // const customerId = customerItem.textContent; // Assuming the customer name is the same as the ID
            const orderHistory = await fetchOrderHistory(customerId); // Fetch the order history for the customer
            displayOrderHistory(orderHistory, customerName, customerId); // Display the order history
        });
    });
  }

// when click the button, all customer will show
customerBtn.addEventListener("click", async () => {
    console.log('customer button clicked!!!!!');
    const customers = await fetchCustomers();
    displayCustomers(customers);
    customerBtn.style.display = 'none';  // vanish the display customer button in case of user keep clicking it
});




async function fetchOrderHistory(customerId) {
    try {
    //   const response = await fetch(`/customer/${customerId}/orders`);
      const response = await fetch(`/order-history?customerId=${customerId}`);
     
      if (response.ok) {
        const orderHistory = await response.json();
        return orderHistory;
      } else {
        console.error(`Failed to fetch order history for customer ${customerId} from the server.`);
        return [];
      }
    } catch (error) {
      console.error(`Error fetching order history for customer ${customerId}:`, error);
      return [];
    }
}

// call in line 284 (inside displayCustomers in line 260)  
function displayOrderHistory(orderHistory, customerName, customerId) {
    // Clear any previous order history
    
    const orderHistoryContainer = document.getElementById('orderHistory');
    orderHistoryContainer.innerHTML = '';
  
    // Display the customer name
    const customerNameElement = document.createElement('h2');
    customerNameElement.textContent = `Order History for ${customerName}`;
    orderHistoryContainer.appendChild(customerNameElement);

    // Display each order in the order history
    orderHistory.forEach(order => {
        const orderDiv = document.createElement("div");
        orderDiv.classList.add("order");
        orderDiv.innerHTML = `
            <h3>Order ID: ${order._id}</h3>
            <button class="deleteOrderButton" data-order-id="${order._id}">Delete Order</button>
            <p>Products:  <br>${order.products.map(product => `
                ${product.name} - Quantity: ${product.quantity}
                <button class="updateQuantityButton" data-order-id="${order._id}" data-product-id="${product.product._id}">Update Quantity</button>
                <button class="deleteProductButton" data-order-id="${order._id}" data-product-id="${product.product._id}">Delete Product</button>
            `).join('<br>')}</p>
            <p>Total Amount: $${order.totalAmount.toFixed(2)}</p>
            <p>Order Date: ${new Date(order.orderDate).toLocaleString()}</p>
        `;
  
        orderHistoryContainer.appendChild(orderDiv);



    });

    // Event listener for updating quantity of a product
    const updateQuantityButtons = document.querySelectorAll('.updateQuantityButton');

    updateQuantityButtons.forEach(updateQuantityButton => {
        updateQuantityButton.addEventListener('click', async () => {
            const orderId = updateQuantityButton.getAttribute('data-order-id');
            const productId = updateQuantityButton.getAttribute('data-product-id');
            console.log('frontend', productId);
            // Show a prompt to enter the new quantity
            const newQuantity = prompt('Enter the new quantity:');
            // Perform the update quantity action using a fetch request
            if (newQuantity !== null) {
                const updateQuantityUrl = `/update-quantity/${orderId}/${productId}`;
                const updateQuantityData = { newQuantity: parseInt(newQuantity) };
                
                try {
                    const response = await fetch(updateQuantityUrl, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(updateQuantityData)
                    });
                    
                    if (response.ok) {
                        console.log('check f');
                        // Handle success, such as refreshing the order history
                        const orderHistory = await fetchOrderHistory(customerId);
                       
                        location.reload();
                    } else {
                        const errorMessage = await response.text(); // Get the error message from the response
                        alert(errorMessage); // Display the error message in an alert
                        console.error('Failed to update quantity:', response.statusText);


                    }
                } catch (error) {
                    console.error('Error updating quantity:', error);
                    location.reload();
                }
            }
        });
    });

    const deleteProductButtons = document.querySelectorAll('.deleteProductButton');

    deleteProductButtons.forEach(deleteProductButton => {
        deleteProductButton.addEventListener('click', async () => {
            const orderId = deleteProductButton.getAttribute('data-order-id');
            const productId = deleteProductButton.getAttribute('data-product-id');
            console.log('frontend', productId);
            // Show a prompt to enter the new quantity


                const deletedProductUrl = `/delete-product/${orderId}/${productId}`;
                
                try {
                    const response = await fetch(deletedProductUrl, {
                        method: 'DELETE',
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    });
                    
                    if (response.ok) {

                        // Handle success, such as refreshing the order history
                        const orderHistory = await fetchOrderHistory(customerId);
                       
                        location.reload();
                        displayOrderHistory(orderHistory);
                    } else {
                        const errorMessage = await response.text(); // Get the error message from the response
                        alert(errorMessage); // Display the error message in an alert
                        console.error('Failed to update quantity:', response.statusText);


                    }
                } catch (error) {
                    console.error('Error updating quantity:', error);
                    location.reload();
                }
            
        });
    });

    const deleteOrderButtons = document.querySelectorAll('.deleteOrderButton');
    deleteOrderButtons.forEach(deleteOrderButton => {
        deleteOrderButton.addEventListener('click', async () => {
            const orderId = deleteOrderButton.getAttribute('data-order-id');
           
            console.log('order id you want to delete: ', orderId);

           
            const deleteOrderUrl = `/delete-order/${orderId}`;
  
            try {
                const response = await fetch(deleteOrderUrl, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
                console.log(response);
                if (response.ok) {
                    console.log('check delete resopnse ok');
                    // Handle success, such as refreshing the order history
                    const orderHistory = await fetchOrderHistory(customerId);
                    location.reload();
                    displayOrderHistory(orderHistory);
                } else {
                    const errorMessage = await response.text(); // Get the error message from the response
                    alert(errorMessage); // Display the error message in an alert
                    console.error('Failed to delete order:', response.statusText);

                }
            } catch (error) {
                console.error('Error delete order:', error);
            }
            
        });
    });
}


// Event listener for deleting a product from an order
const deleteProductButtons = document.querySelectorAll('.deleteProductButton');
deleteProductButtons.forEach(deleteProductButton => {
    deleteProductButton.addEventListener('click', async () => {
        const orderId = deleteProductButton.getAttribute('data-order-id');
        const productId = deleteProductButton.getAttribute('data-product-id');

    });
});
