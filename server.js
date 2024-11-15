const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const session = require('express-session');
const Car = require('./models/Car'); // Car model
const app = express();
const PORT = 3000;
const ITEMS_PER_PAGE = 6; // Number of cars per page

// MongoDB connection setup
const dbUser = process.env.DB_USER || 'root';
const dbPassword = process.env.DB_PASSWORD || 'eepassword';
const dbHost = process.env.DB_HOST || 'mongodb';
const dbName = process.env.DB_NAME || 'autodealership';
const mongoURI = `mongodb://${dbUser}:${dbPassword}@${dbHost}:27017/${dbName}?authSource=admin`;

mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch((error) => console.error('Error connecting to MongoDB:', error));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: true
}));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

const ADMIN_CREDENTIALS = { username: 'admin', password: 'adminpassword' };

// Middleware to check if the user is logged in as admin
function isAdmin(req, res, next) {
  if (req.session.user === 'admin') {
    return next();
  }
  res.redirect('/login');
}

// Home route with sorting, filtering, and pagination
app.get('/', async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const filters = {};
  const sort = {};

  if (req.query.make) filters.make = req.query.make;
  if (req.query.model) filters.model = req.query.model;
  if (req.query.fuelType) filters.fuelType = req.query.fuelType;

  if (req.query.sort === 'price') sort.price = 1;
  else if (req.query.sort === 'mileage') sort.mileage = 1;
  else if (req.query.sort === 'year') sort.year = -1;

  try {
    const carCount = await Car.countDocuments(filters);
    const totalPages = Math.ceil(carCount / ITEMS_PER_PAGE);
    const cars = await Car.find(filters)
      .sort(sort)
      .skip((page - 1) * ITEMS_PER_PAGE)
      .limit(ITEMS_PER_PAGE);

    res.render('homepage', { cars, totalPages, currentPage: page });
  } catch (error) {
    console.error("Error fetching cars:", error);
    res.status(500).send("Error fetching cars.");
  }
});

// Login page (GET)
app.get('/login', (req, res) => {
  res.render('login'); // Render the login page
});

// Handle login form submission (POST)
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
    req.session.user = 'admin';
    res.redirect('/admin'); // Redirect to the admin page after successful login
  } else {
    res.status(401).send("Invalid credentials");
  }
});

// Admin dashboard route
app.get('/admin', isAdmin, async (req, res) => {
  try {
    const cars = await Car.find(); // Fetch all cars to list in the dashboard
    res.render('admin', { cars }); // Pass cars to the admin dashboard
  } catch (error) {
    console.error("Error fetching cars for admin dashboard:", error);
    res.status(500).send("Error fetching cars for admin dashboard.");
  }
});

// Route to render Add Car page (GET)
app.get('/addcar', isAdmin, (req, res) => {
  res.render('addcar'); // Render add car form for admin
});

// Route to handle Add Car form submission (POST)
app.post('/addcar', isAdmin, async (req, res) => {
  const { make, model, year, price, mileage, description, fuelType } = req.body;
  try {
    const newCar = new Car({ make, model, year, price, mileage, description, fuelType });
    await newCar.save();
    res.redirect('/admin'); // Redirect to admin dashboard after adding car
  } catch (error) {
    console.error("Error adding car:", error);
    res.status(500).send("Error adding car.");
  }
});

// Route to view detailed information of a specific car
app.get('/car/:id', async (req, res) => {
  try {
    const car = await Car.findById(req.params.id);
    if (!car) return res.status(404).send("Car not found");
    res.render('carDetails', { car }); // Render detailed car page
  } catch (error) {
    console.error("Error fetching car details:", error);
    res.status(500).send("Error fetching car details.");
  }
});

// Logout route
app.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/');
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
