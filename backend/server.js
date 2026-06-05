const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://db:27017/drivehub';

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('Successfully connected to MongoDB.');
    seedDatabase();
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
  });

// Car Schema & Model
const carSchema = new mongoose.Schema({
  brand: { type: String, required: true },
  model: { type: String, required: true },
  year: { type: Number, required: true },
  price: { type: Number, required: true },
  engineType: { type: String, enum: ['Petrol', 'Diesel', 'Electric', 'Hybrid'], required: true },
  horsepower: { type: Number, required: true },
  torque: { type: Number, required: true },
  acceleration: { type: Number, required: true }, // 0-100 km/h in seconds
  imageUrl: { type: String, required: true },
  description: { type: String, required: true }
}, { timestamps: true });

const Car = mongoose.model('Car', carSchema);

// Initial Seed Data
const initialCars = [
  {
    brand: 'Porsche',
    model: '911 GT3 RS',
    year: 2024,
    price: 223800,
    engineType: 'Petrol',
    horsepower: 518,
    torque: 465,
    acceleration: 3.2,
    imageUrl: 'https://images.unsplash.com/photo-1707230554446-ccde066b5952?auto=format&fit=crop&q=80&w=800',
    description: 'Атмосферен 4.0-литров боксер с мощност 518 к.с., създаден за пистата, но напълно законен за обществени пътища.'
  },
  {
    brand: 'Tesla',
    model: 'Model S Plaid',
    year: 2024,
    price: 89990,
    engineType: 'Electric',
    horsepower: 1020,
    torque: 1420,
    acceleration: 2.1,
    imageUrl: 'https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&q=80&w=800',
    description: 'Три електромотора с обща мощност 1020 к.с. Ускорение, което надминава почти всеки суперавтомобил на планетата.'
  },
  {
    brand: 'BMW',
    model: 'M4 Competition',
    year: 2023,
    price: 86300,
    engineType: 'Petrol',
    horsepower: 503,
    torque: 650,
    acceleration: 3.5,
    imageUrl: 'https://images.unsplash.com/photo-1607853202273-797f1c22a38e?auto=format&fit=crop&q=80&w=800',
    description: 'Спортно купе с 3.0-литров M TwinPower Turbo редови шестцилиндров двигател и интелигентна xDrive система.'
  },
  {
    brand: 'Audi',
    model: 'RS6 Avant GT',
    year: 2024,
    price: 154000,
    engineType: 'Petrol',
    horsepower: 621,
    torque: 850,
    acceleration: 3.3,
    imageUrl: 'https://images.unsplash.com/photo-1606016159991-dfe4f2746ad5?auto=format&fit=crop&q=80&w=800',
    description: 'Супер-комби с V8 битурбо двигател, съчетаващо безкомпромисна практичност и невероятна динамика.'
  },
  {
    brand: 'Ferrari',
    model: 'SF90 Stradale',
    year: 2023,
    price: 524000,
    engineType: 'Hybrid',
    horsepower: 986,
    torque: 800,
    acceleration: 2.5,
    imageUrl: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&q=80&w=800',
    description: 'Хибриден хиперавтомобил с битурбо V8 и три електромотора. Върхът на италианското инженерно изкуство.'
  },
  {
    brand: 'Porsche',
    model: 'Taycan Turbo S',
    year: 2024,
    price: 194900,
    engineType: 'Electric',
    horsepower: 938,
    torque: 1110,
    acceleration: 2.4,
    imageUrl: 'https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&q=80&w=800',
    description: 'Изцяло електрически спортен седан с 800-волтова архитектура и невероятна управляемост в завоите.'
  },
  {
    brand: 'Mercedes-Benz',
    model: 'AMG GT 63 S E Performance',
    year: 2024,
    price: 196800,
    engineType: 'Hybrid',
    horsepower: 831,
    torque: 1470,
    acceleration: 2.9,
    imageUrl: 'https://images.unsplash.com/photo-1616422285623-13ff0162193c?auto=format&fit=crop&q=80&w=800',
    description: 'Хибриден четириврат звяр с 4.0-литров V8 битурбо и заден електромотор за максимална тяга.'
  },
  {
    brand: 'Hyundai',
    model: 'Ioniq 5 N',
    year: 2024,
    price: 66000,
    engineType: 'Electric',
    horsepower: 641,
    torque: 770,
    acceleration: 3.4,
    imageUrl: 'https://images.unsplash.com/photo-1707204917531-15c0e1765fb4?auto=format&fit=crop&q=80&w=800',
    description: 'Високоскоростен електрически кросоувър със симулация на 8-степенна скоростна кутия и звук на двигател.'
  }
];

async function seedDatabase() {
  try {
    const count = await Car.countDocuments();
    if (count === 0) {
      console.log('Seeding initial car data...');
      await Car.insertMany(initialCars);
      console.log('Database seeded successfully.');
    } else {
      console.log('Database already has data. Skipping seed.');
    }
  } catch (err) {
    console.error('Error seeding database:', err);
  }
}

// Routes
// 1. Get all cars with filtering, searching, and sorting
app.get('/api/cars', async (req, res) => {
  try {
    const { brand, engineType, minPrice, maxPrice, search, sortBy } = req.query;
    let query = {};

    if (brand) query.brand = new RegExp(brand, 'i');
    if (engineType) query.engineType = engineType;
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }
    if (search) {
      query.$or = [
        { brand: new RegExp(search, 'i') },
        { model: new RegExp(search, 'i') },
        { description: new RegExp(search, 'i') }
      ];
    }

    let sortOption = { createdAt: -1 };
    if (sortBy === 'price_asc') sortOption = { price: 1 };
    if (sortBy === 'price_desc') sortOption = { price: -1 };
    if (sortBy === 'hp_desc') sortOption = { horsepower: -1 };

    const cars = await Car.find(query).sort(sortOption);
    res.json(cars);
  } catch (err) {
    res.status(500).json({ error: 'Възникна грешка при извличане на автомобилите' });
  }
});

// 2. Add a new car
app.post('/api/cars', async (req, res) => {
  try {
    const newCar = new Car(req.body);
    const savedCar = await newCar.save();
    res.status(201).json(savedCar);
  } catch (err) {
    res.status(400).json({ error: 'Възникна грешка при добавяне: ' + err.message });
  }
});

// 3. Delete a car
app.delete('/api/cars/:id', async (req, res) => {
  try {
    const deletedCar = await Car.findByIdAndDelete(req.params.id);
    if (!deletedCar) return res.status(404).json({ error: 'Автомобилът не е намерен' });
    res.json({ message: 'Автомобилът беше изтрит успешно', deletedCar });
  } catch (err) {
    res.status(500).json({ error: 'Възникна грешка при изтриването' });
  }
});

// 4. Get analytics statistics
app.get('/api/stats', async (req, res) => {
  try {
    const totalCars = await Car.countDocuments();
    if (totalCars === 0) {
      return res.json({
        totalCars: 0,
        totalFleetValue: 0,
        averagePrice: 0,
        engineDistribution: [],
        brandDistribution: []
      });
    }

    const valueAggregation = await Car.aggregate([
      {
        $group: {
          _id: null,
          totalValue: { $sum: '$price' },
          avgPrice: { $avg: '$price' }
        }
      }
    ]);

    const engineAggregation = await Car.aggregate([
      {
        $group: {
          _id: '$engineType',
          count: { $sum: 1 }
        }
      }
    ]);

    const brandAggregation = await Car.aggregate([
      {
        $group: {
          _id: '$brand',
          count: { $sum: 1 },
          avgPrice: { $avg: '$price' }
        }
      },
      { $sort: { count: -1 } }
    ]);

    res.json({
      totalCars,
      totalFleetValue: valueAggregation[0]?.totalValue || 0,
      averagePrice: Math.round(valueAggregation[0]?.avgPrice || 0),
      engineDistribution: engineAggregation.map(item => ({ type: item._id, count: item.count })),
      brandDistribution: brandAggregation.map(item => ({ brand: item._id, count: item.count, avgPrice: Math.round(item.avgPrice) }))
    });
  } catch (err) {
    res.status(500).json({ error: 'Възникна грешка при изчисляване на статистиката' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
