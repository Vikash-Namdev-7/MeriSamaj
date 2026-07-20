require('dotenv').config();
const mongoose = require('mongoose');
const Voting = require('../src/models/Voting');
const Community = require('../src/models/Community');
const User = require('../src/models/User');

const seedVoting = async () => {
  try {
    // Connect to database directly
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      throw new Error('MONGODB_URI is not defined in .env');
    }
    await mongoose.connect(uri);
    console.log('Connected to MongoDB');

    // Get a community to bind votings to
    const community = await Community.findOne();
    if (!community) {
      throw new Error('No community found in DB. Please seed a community first.');
    }

    // Get a user to act as creator
    const user = await User.findOne();
    if (!user) {
      throw new Error('No user found in DB.');
    }

    // Clear existing votings for this community to avoid duplicates in testing
    await Voting.deleteMany({ communityId: community._id });
    console.log('Cleared existing votings for community');

    // Generate Dates
    const now = new Date();
    const futureDate = new Date();
    futureDate.setDate(now.getDate() + 10);
    const pastDate = new Date();
    pastDate.setDate(now.getDate() - 10);
    const pastEndDate = new Date();
    pastEndDate.setDate(now.getDate() - 2);

    const mockVotings = [
      {
        title: "Community Annual Event Planning",
        description: "Vote for the upcoming community annual event location and theme.",
        type: "Event Election",
        status: "Active",
        startDate: now,
        endDate: futureDate,
        communityId: community._id,
        createdBy: user._id,
        candidates: [
          {
            name: "Rajesh Sharma",
            initials: "RS",
            age: 45,
            profession: "Businessman",
            avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
            shortIntro: "Committed to transparent management.",
            bio: "Experienced community member.",
            manifesto: ["Complete digitalization", "Financial assistance"],
            experience: "12 years",
            education: "Graduate"
          },
          {
            name: "Suresh Yadav",
            initials: "SY",
            age: 42,
            profession: "Social Worker",
            avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&h=150&fit=crop&crop=face",
            shortIntro: "Education and health support.",
            bio: "Full-time social worker.",
            manifesto: ["Scholarship fund", "Medical aid"],
            experience: "10 years",
            education: "M.A."
          }
        ]
      },
      {
        title: "Community Welfare Initiative",
        description: "Decide on the new welfare initiative to prioritize this year.",
        type: "Initiative Poll",
        status: "Active",
        startDate: now,
        endDate: futureDate,
        communityId: community._id,
        createdBy: user._id,
        candidates: [
          {
            name: "Initiative A",
            initials: "IA",
            shortIntro: "Focus on Education",
            bio: "Building more schools and providing scholarships."
          },
          {
            name: "Initiative B",
            initials: "IB",
            shortIntro: "Focus on Health",
            bio: "Free health checkups and medical camps."
          }
        ]
      },
      {
        title: "Community Committee Decision",
        description: "Select the head of the organizing committee.",
        type: "Committee Election",
        status: "Completed",
        startDate: pastDate,
        endDate: pastEndDate,
        communityId: community._id,
        createdBy: user._id,
        candidates: [
          {
            name: "Candidate A",
            initials: "CA",
            shortIntro: "Experienced Leader"
          },
          {
            name: "Candidate B",
            initials: "CB",
            shortIntro: "Young Visionary"
          }
        ]
      }
    ];

    await Voting.insertMany(mockVotings);
    console.log('Successfully seeded 3 voting records.');

  } catch (err) {
    console.error('Seeding error:', err);
  } finally {
    mongoose.connection.close();
  }
};

seedVoting();
