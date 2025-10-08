const mongoose = require('mongoose');
const Listing = require('./models/listing.js');
const axios = require('axios');

// Sample coordinates for common locations
const locationCoordinates = {
  'Malibu': [-118.7798, 34.0259],
  'New York City': [-74.0060, 40.7128],
  'Aspen': [-106.8175, 39.1911],
  'Florence': [11.2558, 43.7696],
  'Portland': [-122.6784, 45.5152],
  'Cancun': [-86.8515, 21.1619],
  'Lake Tahoe': [-120.0324, 39.0968],
  'Los Angeles': [-118.2437, 34.0522],
  'Verbier': [7.2284, 46.0963],
  'Serengeti National Park': [34.8888, -2.3333],
  'Amsterdam': [4.9041, 52.3676],
  'Fiji': [178.0650, -18.1248],
  'Cotswolds': [-1.8094, 51.8330],
  'Boston': [-71.0589, 42.3601],
  'Bali': [115.0920, -8.4095],
  'Banff': [-115.5708, 51.1784],
  'Miami': [-80.1918, 25.7617],
  'Phuket': [98.3923, 7.8804],
  'Scottish Highlands': [-4.2026, 57.2781],
  'Dubai': [55.2708, 25.2048],
  'Montana': [-110.3626, 46.9219],
  'Mykonos': [25.3289, 37.4467],
  'Costa Rica': [-83.7534, 9.7489],
  'Charleston': [-79.9311, 32.7765],
  'Tokyo': [139.6917, 35.6895],
  'New Hampshire': [-71.5376, 43.4525],
  'Maldives': [73.2207, 3.2028]
};

async function addCoordinatesToListings() {
  try {
    await mongoose.connect(process.env.ATLASDB_URL || 'mongodb://127.0.0.1:27017/wanderlust');
    console.log('Connected to MongoDB');

    const listings = await Listing.find({ geometry: { $exists: false } });
    console.log(`Found ${listings.length} listings without coordinates`);

    for (let listing of listings) {
      let coordinates = locationCoordinates[listing.location];
      
      if (!coordinates) {
        // Try to get coordinates from OpenStreetMap
        try {
          const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(listing.location)}&format=json&limit=1`;
          const response = await axios.get(url, { 
            headers: { 'User-Agent': 'Wanderlust/1.0' } 
          });
          
          if (response.data && response.data.length > 0) {
            const lon = parseFloat(response.data[0].lon);
            const lat = parseFloat(response.data[0].lat);
            coordinates = [lon, lat];
          } else {
            // Default to center of India if location not found
            coordinates = [78.9629, 20.5937];
          }
          
          // Add delay to respect rate limits
          await new Promise(resolve => setTimeout(resolve, 1000));
        } catch (error) {
          console.log(`Error geocoding ${listing.location}:`, error.message);
          coordinates = [78.9629, 20.5937]; // Default coordinates
        }
      }

      listing.geometry = {
        type: 'Point',
        coordinates: coordinates
      };

      await listing.save();
      console.log(`Updated ${listing.title} with coordinates: ${coordinates}`);
    }

    console.log('All listings updated with coordinates!');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

// Load environment variables
require('dotenv').config();

addCoordinatesToListings();