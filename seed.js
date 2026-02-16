const mongoose = require('mongoose');
require('dotenv').config();
const Event = require('./models/Event');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/appointmentapp';

async function seed() {
  await mongoose.connect(MONGO_URI);

  const count = await Event.countDocuments();
  if (count > 0) {
    console.log('Events collection already has data, skipping seeding.');
    process.exit(0);
  }

  const sample = [
    { title: 'Community Yoga', description: 'All levels welcome. Bring a mat.', date: '2026-03-01', location: 'Community Center', organizerId: 'seed' },
    { title: 'JavaScript Workshop', description: 'Intro to modern JS.', date: '2026-03-05', location: 'Tech Hub', organizerId: 'seed' },
    { title: 'Spring Farmers Market', description: 'Local produce and goods.', date: '2026-03-12', location: 'Main Square', organizerId: 'seed' },
    { title: 'Charity Run', description: '5K fundraiser for the shelter.', date: '2026-04-02', location: 'Riverside Park', organizerId: 'seed' },
    { title: 'Artisan Fair', description: 'Handmade crafts and live music.', date: '2026-04-10', location: 'Market Hall', organizerId: 'seed' },
  ];

  await Event.insertMany(sample);
  console.log('Seeded 5 events.');
  process.exit(0);
}

seed().catch(err => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
