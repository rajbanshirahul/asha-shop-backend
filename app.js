const express = require('express');
const app = express();
const morgan = require('morgan');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv/config');
const authJwt = require('./middleware/jwtValidator');
const { errorHandler } = require('./middleware/errorMiddleware.js');

//Routes
const categoriesRoutes = require('./routes/categories');
const productsRoutes = require('./routes/products');
const usersRoutes = require('./routes/users');
const ordersRoutes = require('./routes/orders');

const { HOST, PORT, API_URL, CONNECTION_STRING } = process.env;

// Middleware
app.use(
  cors({
    origin: '*',
  })
);
app.use(express.json());
app.use(morgan('tiny'));
app.use(authJwt());

app.use(`${API_URL}/categories`, categoriesRoutes);
app.use(`${API_URL}/products`, productsRoutes);
app.use(`${API_URL}/users`, usersRoutes);
app.use(`${API_URL}/orders`, ordersRoutes);

// error handler middleware
app.use(errorHandler);

mongoose
  .connect(CONNECTION_STRING, {
    useNewUrlParser: true,
    useFindAndModify: false,
    useCreateIndex: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('Connected to MongoDB...');
  })
  .catch((err) => {
    console.log(err);
  });

app.listen(PORT, () => {
  console.log(`Server is running on ${HOST}:${PORT}`);
});
