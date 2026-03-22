const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '.env') });

const MONGO_URL = process.env.MONGO_URL;

async function updateJobs() {
  try {
    await mongoose.connect(MONGO_URL);
    console.log('Connected to MongoDB');

    // Get the first user to assign as a default owner for existing ownerless jobs
    const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }), 'users');
    const firstUser = await User.findOne({});
    
    if (!firstUser) {
      console.error('No users found in database. Please create a user first.');
      return;
    }

    console.log(`Using ${firstUser.name} (${firstUser._id}) as default owner.`);

    const Job = mongoose.model('Job', new mongoose.Schema({}, { strict: false }), 'jobs');
    const result = await Job.updateMany(
      { $or: [{ user: { $exists: false } }, { user: null }] },
      { $set: { user: firstUser._id } }
    );

    console.log(`Updated ${result.modifiedCount} jobs.`);

  } catch (err) {
    console.error(err);
  } finally {
    await mongoose.disconnect();
  }
}

updateJobs();
