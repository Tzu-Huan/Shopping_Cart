# Shopping_Cart

- This project utilizes Node.js (Express and Mongoose) along with MongoDB.
- link: https://github.com/Tzu-Huan/Shopping_Cart/tree/master
## Demo
### Part 1: Customer Interface
https://github.com/Tzu-Huan/Shopping_Cart/assets/121821260/3aa7d5e5-2e7a-4d15-b670-d098888a7290
### Part 2: Admin Interface
https://github.com/Tzu-Huan/Shopping_Cart/assets/121821260/bc9eff3e-a276-427b-8402-eb47af724cd0
## How to run this project?
https://github.com/Tzu-Huan/Shopping_Cart/assets/121821260/32f33190-f2c7-4443-8715-0d66631d7c5c
### 1. Prepare MongoDB:
- Download MongoDB
- create a directory named 'mongodb'
- Place the downloaded MongoDB installation file inside the 'mongodb' directory. For instance, if the downloaded file is named 'mongodb-macos-aarch64-6.0.8', your directory should look like this:
```
mongodb/
  mongodb-macos-aarch64-6.0.8/
```
- Create another directory named 'mongo_data' within the 'mongodb' directory. Now you should have two subdirectories: 'mongodb-macos-aarch64-6.0.8' and 'mongo_data'.

- Open your terminal and navigate to the 'mongodb' directory:

```
cd mongodb
```
- Start MongoDB using the following command, specifying the path to the 'mongo_data' directory:

```
mongodb-macos-aarch64-6.0.8/bin/mongod --dbpath=mongo_data
```
- If you've used a different name for the 'mongo_data' directory, make sure to adjust the path accordingly.


### 2. Navigate to the Project Directory:
- Move to the 'Shopping_Cart' project directory:

```
cd path_to_Shopping_Cart
```
Replace 'path_to_Shopping_Cart' with the actual path to your project folder.
After that, run the following commands one by one:
```
node initDB.js
```
```
node index.js
```

### Useful URLs
- Access the Home Page of application through the URL: http://localhost:3000/index.html
- Access the Admin page of application through the URL: http://localhost:3000/admin.html
### Three REST APIs (JSON and XML):
- Product List: http://localhost:3000/products
- Product Matching a Specified Name (Example: 'iPhone 13'): http://localhost:3000/products/iPhone%2013
- Products within a Specified Price Range (Low Price - High Price): http://localhost:3000/products/price/600/1600
