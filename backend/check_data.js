const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '.env') });

const MONGO_URL = process.env.MONGO_URL;

async function checkData() {
  try {
    await mongoose.connect(MONGO_URL);
    console.log('--- Database Check ---');

    const Job = mongoose.model('Job', new mongoose.Schema({}, { strict: false }), 'jobs');
    const jobs = await Job.find({});
    console.log(`Jobs: ${jobs.length}`);
    jobs.forEach(j => {
      console.log(` - ID: ${j._id}, Title: ${j.title}, User: ${j.user}`);
    });

    const Notification = mongoose.model('Notification', new mongoose.Schema({}, { strict: false }), 'notifications');
    const notifications = await Notification.find({});
    console.log(`Notifications: ${notifications.length}`);
    notifications.forEach(n => {
      console.log(` - Type: ${n.type}, Recipient: ${n.recipient}, Title: ${n.title}`);
    });

    const Proposal = mongoose.model('Proposal', new mongoose.Schema({}, { strict: false }), 'proposals');
    const proposals = await Proposal.find({});
    console.log(`Proposals: ${proposals.length}`);

  } catch (err) {
    console.error(err);
  } finally {
    await mongoose.disconnect();
  }
}

checkData();
