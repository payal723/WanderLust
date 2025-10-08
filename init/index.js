
const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");

const MONGO_URL = "mongodb+srv://payal:payal.jat00@cluster0.kgtzu1v.mongodb.net/wanderLust?retryWrites=true&w=majority&appName=Cluster0";
async function main() {
  await mongoose.connect(MONGO_URL);
  console.log("✅ Connected to DB");
}

const initDB = async () => {
  await Listing.deleteMany({});
  
  // Add geometry coordinates for each listing (longitude, latitude)
  const locationCoordinates = {
    "Malibu": [-118.7798, 34.0259],
    "New York City": [-74.0060, 40.7128], 
    "Aspen": [-106.8175, 39.1911],
    "Florence": [11.2558, 43.7696],
    "Portland": [-122.6784, 45.5152],
    "Cancun": [-86.8515, 21.1619],
    "Lake Tahoe": [-120.0324, 39.0968],
    "Los Angeles": [-118.2437, 34.0522],
    "Verbier": [7.2284, 46.0963],
    "Serengeti National Park": [34.8888, -2.3333],
    "Amsterdam": [4.9041, 52.3676],
    "Fiji": [178.0650, -18.1248],
    "Cotswolds": [-1.8094, 51.8330],
    "Boston": [-71.0589, 42.3601],
    "Bali": [115.0920, -8.4095],
    "Banff": [-115.5708, 51.1784],
    "Miami": [-80.1918, 25.7617],
    "Phuket": [98.3923, 7.8804],
    "Scottish Highlands": [-4.2026, 57.2781],
    "Dubai": [55.2708, 25.2048],
    "Montana": [-110.3626, 46.9219],
    "Mykonos": [25.3289, 37.4467],
    "Costa Rica": [-83.7534, 9.7489],
    "Charleston": [-79.9311, 32.7765],
    "Tokyo": [139.6503, 35.6762],
    "New Hampshire": [-71.5376, 43.4525],
    "Maldives": [73.2207, 3.2028]
  };
  
  initData.data = initData.data.map((obj) => {
    const coords = locationCoordinates[obj.location] || [78.9629, 20.5937]; // Default to India center
    return {
      ...obj,
      owner: "68cbbc6877d9e548173343dc",
      geometry: {
        type: "Point",
        coordinates: coords
      }
    };
  });
  
  await Listing.insertMany(initData.data);
  console.log("✅ Data was initialized with coordinates");
};

main()
  .then(() => initDB())
  .then(() => mongoose.connection.close())
  .catch((err) => console.log("❌ Error:", err));
