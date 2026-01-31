require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Complaint = require('../models/Complaint');

// Sample data: 1 citizen (for testing), 4 staff logins (admin + 3 departments)
const users = [
  {
    name: 'John Citizen',
    email: 'citizen@test.com',
    password: 'password123',
    role: 'citizen'
  },
  {
    name: 'Admin (All Departments)',
    email: 'admin@test.com',
    password: 'password123',
    role: 'admin'
  },
  {
    name: 'Roads Department Official',
    email: 'official.roads@test.com',
    password: 'password123',
    role: 'official',
    department: 'Roads'
  },
  {
    name: 'Electricity Department Official',
    email: 'official.electricity@test.com',
    password: 'password123',
    role: 'official',
    department: 'Electricity'
  },
  {
    name: 'Sanitation Department Official',
    email: 'official.sanitation@test.com',
    password: 'password123',
    role: 'official',
    department: 'Sanitation'
  }
];

const sampleComplaints = [
  {
    complaintText: 'There is a large pothole on Main Street that is causing damage to vehicles. It has been there for weeks and is getting worse with rain.',
    location: 'Main Street, near City Hall',
    department: 'Roads',
    priority: 'High',
    priorityReason: 'Safety hazard affecting multiple vehicles daily',
    status: 'In Progress'
  },
  {
    complaintText: 'Street lights are not working in our neighborhood for the past 3 days. It is very dark and unsafe at night.',
    location: 'Green Valley Sector 5',
    department: 'Electricity',
    priority: 'High',
    priorityReason: 'Public safety concern affecting entire neighborhood',
    status: 'Pending'
  },
  {
    complaintText: 'The drainage system is clogged and water is accumulating on the road during rain.',
    location: 'Park Avenue, Block B',
    department: 'Drainage',
    priority: 'Medium',
    priorityReason: 'Recurring issue that needs attention before monsoon',
    status: 'Pending'
  },
  {
    complaintText: 'Garbage has not been collected from our area for 4 days. The smell is unbearable.',
    location: 'Riverside Colony, Gate 2',
    department: 'Sanitation',
    priority: 'High',
    priorityReason: 'Health hazard requiring immediate attention',
    status: 'Resolved',
    resolutionRemarks: 'Garbage collection team dispatched. Issue resolved.'
  },
  {
    complaintText: 'A traffic signal at the intersection is malfunctioning and causing confusion.',
    location: 'Highway Junction, Sector 12',
    department: 'Roads',
    priority: 'High',
    priorityReason: 'Traffic safety issue requiring urgent repair',
    status: 'Pending'
  }
];

const seedDatabase = async () => {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Complaint.deleteMany({});
    console.log('Cleared existing data');

    // Create users
    const createdUsers = await User.create(users);
    console.log(`Created ${createdUsers.length} users`);

    // Get citizen ID for complaints
    const citizen = createdUsers.find(u => u.role === 'citizen');

    // Create complaints with citizen ID
    const complaintsWithCitizen = sampleComplaints.map(complaint => ({
      ...complaint,
      citizenId: citizen._id
    }));

    const createdComplaints = await Complaint.create(complaintsWithCitizen);
    console.log(`Created ${createdComplaints.length} sample complaints`);

    console.log('\n=== Seed Data Summary ===');
    console.log('\nCitizen (for testing):');
    createdUsers.filter(u => u.role === 'citizen').forEach(u => {
      console.log(`  - ${u.email} / password123`);
    });
    console.log('\nAdmin (sees all departments):');
    createdUsers.filter(u => u.role === 'admin').forEach(u => {
      console.log(`  - ${u.email} / password123`);
    });
    console.log('\nDepartment Officials (see only their department):');
    createdUsers.filter(u => u.role === 'official').forEach(u => {
      console.log(`  - ${u.email} / password123 (${u.department})`);
    });

    console.log('\n✅ Database seeded successfully!');
    process.exit(0);

  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
