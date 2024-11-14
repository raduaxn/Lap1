// models/Car.js
const mongoose = require('mongoose');


const carSchema = new mongoose.Schema({
  make: String,
  model: String,
  year: Number,
  mileage: Number,
  price: Number,
  fuelType: String,
  imagePath: String,
  description: String
});



const Car = mongoose.model('Car', carSchema);

module.exports = Car;
