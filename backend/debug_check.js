const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({ path: 'c:/Users/HP/OneDrive/Desktop/FREECONE/backend/.env' });

async function run() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    const Message = mongoose.model('Message', new mongoose.Schema({}, { strict: false }));
    const Conversation = mongoose.model('Conversation', new mongoose.Schema({}, { strict: false }));
    const Offer = mongoose.model('Offer', new mongoose.Schema({}, { strict: false }));

    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);

    const recentMessages = await Message.find({ createdAt: { $gte: fiveMinutesAgo } });
    console.log(`\n--- Recent Messages (${recentMessages.length}) ---`);
    recentMessages.forEach(m => console.log(`- ${m.content} (sender: ${m.sender})`));

    const recentOffers = await Offer.find({ updatedAt: { $gte: fiveMinutesAgo } });
    console.log(`\n--- Recent Status-Updated Offers (${recentOffers.length}) ---`);
    recentOffers.forEach(o => console.log(`- ${o.jobTitle}: status=${o.status}`));

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

run();
