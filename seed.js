const mongoose = require('mongoose');
const Car = require('./models/Car'); // Adjust the path if necessary

const dbUser = process.env.DB_USER || 'root';
const dbPassword = process.env.DB_PASSWORD || 'eepassword';
const dbHost = process.env.DB_HOST || 'mongodb';
const dbName = process.env.DB_NAME || 'autodealership';
const mongoURI = `mongodb://${dbUser}:${dbPassword}@${dbHost}:27017/${dbName}?authSource=admin`;

mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log("Connected to MongoDB for seeding.");
}).catch((err) => console.error("MongoDB connection error:", err));

const seedCars = async () => {
  const cars = [
    { make: 'Toyota', model: 'Camry', year: 2018, price: 18000, mileage: 40000, description: 'Reliable sedan.' },
    { make: 'Honda', model: 'Civic', year: 2019, price: 17000, mileage: 30000, description: 'Efficient and stylish.' },
    // Add more cars as needed
  ];
  try {
    await Car.insertMany(cars);
    console.log("Cars added to the database.");
    mongoose.connection.close();
  } catch (error) {
    console.error("Error adding cars:", error);
  }
};

seedCars();
