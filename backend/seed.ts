import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./models/User";

dotenv.config();

const seedFreelancers = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL as string);
    console.log("Connected to MongoDB for seeding...");

    const freelancers = [
      {
        name: "Sarah Jenkins",
        email: "sarah@example.com",
        password: "password123",
        role: "freelancer",
        rating: 4.9,
        description: "Creating intuitive digital experiences for over 8 years. Specialized in SaaS and mobile applications.",
        skills: ["Figma", "Prototyping", "User Research", "+4"],
        rate: 85,
        imageUrl: "https://i.pravatar.cc/150?u=sarah"
      },
      {
        name: "Marcus Thorne",
        email: "marcus@example.com",
        password: "password123",
        role: "freelancer",
        rating: 5.0,
        description: "Expert in React, Node.js and AWS infrastructure. I build scalable web applications with clean code.",
        skills: ["React", "TypeScript", "Node.js"],
        rate: 120,
        imageUrl: "https://i.pravatar.cc/150?u=marcus"
      }
    ];

    for (const data of freelancers) {
      const existing = await User.findOne({ email: data.email });
      if (!existing) {
        await User.create(data);
        console.log(`Created freelancer: ${data.name}`);
      } else {
        await User.updateOne({ email: data.email }, data);
        console.log(`Updated freelancer: ${data.name}`);
      }
    }

    console.log("Seeding complete!");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  }
};

seedFreelancers();
