# Shopping_Cart

This is a project using Node.js (Express, Mongoose) and MongoDB

How to run this project?

- Download MongoDB
- create a directory named as 'mongodb'
- put download file inside 'mongodb' (For example, my download file is mongodb-macos-aarch64-6.0.8)
- create a directory named as 'mongo_data' in mongodb (now you should have two files inside 'mongodb')
- cd 'mongodb'
- start MongoDB (download_file_name/bin/mongod --dbpath=mongo_data) 
- mongo_data is what we create previously if you use different name, change it.

```
mongodb-macos-aarch64-6.0.8/bin/mongod --dbpath=mongo_data
```
- change path to Shopping_cart
```
cd Shopping_Cart
```
```
node initDB.js
node index.js
```

- URL: http://localhost:3000/index.html

Three REST APIs (JSON and XML):
- http://localhost:3000/products (Product list)
- http://localhost:3000/products/iPhone%2013 (Product matching a specified name, use 'iPhone 13' as exapmle)
- http://localhost:3000/products/price/600/1600 (Products within a specified price range (low price, high price))
