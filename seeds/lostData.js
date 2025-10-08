const mongoose = require('mongoose');
const Listing  = require('../models/listing');
const {data}   = require('../init/data.js');   // sampleListings array

const URI = 'mongodb+srv://payal:payal.jat00@cluster0.kgtzu1v.mongodb.net/wanderLust?retryWrites=true&w=majority';
async function seedDB(){
  try{
    await mongoose.connect(URI);
    await Listing.deleteMany({});
    await Listing.insertMany(data);
    console.log('SEED DONE ✅ – Atlas docs:', await Listing.countDocuments());
    mongoose.disconnect();
  }catch(err){
    console.log('Seed error:', err.message);
  }
}
seedDB();