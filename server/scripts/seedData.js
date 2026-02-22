require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Complaint = require('../models/Complaint');
const { checkEscalations } = require('../services/escalationService');

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
    name: 'Drainage Department Official',
    email: 'official.drainage@test.com',
    password: 'password123',
    role: 'official',
    department: 'Drainage'
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
    basePriority: 'High',
    priority: 'High',
    priorityReason: 'Safety hazard affecting multiple vehicles daily',
    status: 'In Progress'
  },
  {
    complaintText: 'Street lights are not working in our neighborhood for the past 3 days. It is very dark and unsafe at night.',
    location: 'Green Valley Sector 5',
    department: 'Electricity',
    basePriority: 'High',
    priority: 'High',
    priorityReason: 'Public safety concern affecting entire neighborhood',
    status: 'Pending'
  },
  {
    complaintText: 'The drainage system is clogged and water is accumulating on the road during rain.',
    location: 'Park Avenue, Block B',
    department: 'Drainage',
    basePriority: 'Medium',
    priority: 'Medium',
    priorityReason: 'Recurring issue that needs attention before monsoon',
    status: 'Pending'
  },
  {
    complaintText: 'Garbage has not been collected from our area for 4 days. The smell is unbearable.',
    location: 'Riverside Colony, Gate 2',
    department: 'Sanitation',
    basePriority: 'High',
    priority: 'High',
    priorityReason: 'Health hazard requiring immediate attention',
    status: 'Resolved',
    resolutionRemarks: 'Garbage collection team dispatched. Issue resolved.'
  },
  {
    complaintText: 'A traffic signal at the intersection is malfunctioning and causing confusion.',
    location: 'Highway Junction, Sector 12',
    department: 'Roads',
    basePriority: 'High',
    priority: 'High',
    priorityReason: 'Traffic safety issue requiring urgent repair',
    status: 'Pending'
  }
];

// All departments × all priorities (High, Medium, Low) × mixed statuses – for full feature visibility
const allDepartmentsComplaints = [
  // ROADS – High, Medium, Low
  { complaintText: 'Deep pothole on Main Street causing vehicle damage and accidents.', location: 'Main Street, Block 1', department: 'Roads', basePriority: 'High', priority: 'High', priorityReason: 'Safety hazard', status: 'Pending' },
  { complaintText: 'Collapsed road edge near school. Children and vehicles at risk.', location: 'School Road, Sector 2', department: 'Roads', basePriority: 'High', priority: 'High', priorityReason: 'Near school', status: 'In Progress' },
  { complaintText: 'Cracked pavement and uneven footpath causing tripping.', location: 'Market Lane, Sector 3', department: 'Roads', basePriority: 'Medium', priority: 'Medium', priorityReason: 'Pedestrian safety', status: 'Pending' },
  { complaintText: 'Road markings faded. Lane discipline poor at junction.', location: 'Junction Road, Sector 4', department: 'Roads', basePriority: 'Medium', priority: 'Medium', priorityReason: 'Traffic clarity', status: 'Resolved', resolutionRemarks: 'Markings repainted.' },
  { complaintText: 'Minor pothole on side street. Low traffic area.', location: 'Quiet Lane, Block 5', department: 'Roads', basePriority: 'Low', priority: 'Low', priorityReason: 'Low impact', status: 'Pending' },
  { complaintText: 'Speed breaker needs repainting for visibility.', location: 'Residential Road, Sector 6', department: 'Roads', basePriority: 'Low', priority: 'Low', priorityReason: 'Maintenance', status: 'In Progress' },
  // ELECTRICITY – High, Medium, Low
  { complaintText: 'Live wire hanging low near bus stop. Immediate danger.', location: 'Bus Stop Road, Sector 7', department: 'Electricity', basePriority: 'High', priority: 'High', priorityReason: 'Public safety', status: 'Pending' },
  { complaintText: 'Power pole leaning. May fall during storm.', location: 'Storm Avenue, Block 8', department: 'Electricity', basePriority: 'High', priority: 'High', priorityReason: 'Structural hazard', status: 'In Progress' },
  { complaintText: 'Street lights not working on one side of the road.', location: 'Dark Lane, Sector 9', department: 'Electricity', basePriority: 'Medium', priority: 'Medium', priorityReason: 'Partial outage', status: 'Pending' },
  { complaintText: 'Flickering lights in the park. Needs repair.', location: 'Park Road, Sector 10', department: 'Electricity', basePriority: 'Medium', priority: 'Medium', priorityReason: 'Faulty circuit', status: 'Resolved', resolutionRemarks: 'Circuit fixed.' },
  { complaintText: 'Single street light not working in colony.', location: 'Colony Lane, Block 11', department: 'Electricity', basePriority: 'Low', priority: 'Low', priorityReason: 'Local issue', status: 'Pending' },
  { complaintText: 'Meter box door broken. Cosmetic but should be fixed.', location: 'Meter Lane, Sector 12', department: 'Electricity', basePriority: 'Low', priority: 'Low', priorityReason: 'Minor', status: 'In Progress' },
  // DRAINAGE – High, Medium, Low
  { complaintText: 'Sewage overflow on main road. Health hazard and smell.', location: 'Main Drain Road, Block 13', department: 'Drainage', basePriority: 'High', priority: 'High', priorityReason: 'Health hazard', status: 'Pending' },
  { complaintText: 'Storm drain blocked near hospital. Water logging during rain.', location: 'Hospital Road, Sector 14', department: 'Drainage', basePriority: 'High', priority: 'High', priorityReason: 'Near hospital', status: 'In Progress' },
  { complaintText: 'Drain cover missing. Pedestrians at risk.', location: 'Cover Lane, Sector 15', department: 'Drainage', basePriority: 'Medium', priority: 'Medium', priorityReason: 'Safety', status: 'Pending' },
  { complaintText: 'Drainage channel partially clogged. Slow flow.', location: 'Channel Road, Block 16', department: 'Drainage', basePriority: 'Medium', priority: 'Medium', priorityReason: 'Reduced capacity', status: 'Resolved', resolutionRemarks: 'Cleaned.' },
  { complaintText: 'Minor water accumulation after heavy rain. Clears in hours.', location: 'Low Point Lane, Sector 17', department: 'Drainage', basePriority: 'Low', priority: 'Low', priorityReason: 'Minor', status: 'Pending' },
  { complaintText: 'Gutter needs cleaning. No overflow yet.', location: 'Gutter Lane, Block 18', department: 'Drainage', basePriority: 'Low', priority: 'Low', priorityReason: 'Preventive', status: 'In Progress' },
  // SANITATION – High, Medium, Low
  { complaintText: 'Garbage pile near food market. Flies and smell. Health risk.', location: 'Market Garbage Point, Sector 19', department: 'Sanitation', basePriority: 'High', priority: 'High', priorityReason: 'Near food', status: 'Pending' },
  { complaintText: 'Medical waste visible in general bin. Improper disposal.', location: 'Clinic Road, Block 20', department: 'Sanitation', basePriority: 'High', priority: 'High', priorityReason: 'Bio hazard', status: 'In Progress' },
  { complaintText: 'Bin overflow. Collection delayed by 2 days.', location: 'Bin Street, Sector 21', department: 'Sanitation', basePriority: 'Medium', priority: 'Medium', priorityReason: 'Delayed collection', status: 'Pending' },
  { complaintText: 'Stray dogs around dumpster. Regular cleaning needed.', location: 'Dumpster Lane, Block 22', department: 'Sanitation', basePriority: 'Medium', priority: 'Medium', priorityReason: 'Recurring', status: 'Resolved', resolutionRemarks: 'Schedule tightened.' },
  { complaintText: 'Single bin in park often full on weekends.', location: 'Park Bin, Sector 23', department: 'Sanitation', basePriority: 'Low', priority: 'Low', priorityReason: 'Peak load', status: 'Pending' },
  { complaintText: 'Litter near bench. Needs periodic sweep.', location: 'Bench Lane, Block 24', department: 'Sanitation', basePriority: 'Low', priority: 'Low', priorityReason: 'Routine', status: 'In Progress' }
];

// Helper: date N days ago (for escalation demo)
const daysAgo = (days) => {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d;
};

// Escalation demo: complaints that will trigger alerts when "Run escalation check" is used
const escalationDemoComplaints = [
  {
    complaintText: 'Sewage overflow near the school gate. Children are at risk. Reported multiple times with no response.',
    location: 'Near Central School, Block A',
    department: 'Drainage',
    basePriority: 'High',
    priority: 'High',
    priorityReason: 'Safety risk near school',
    status: 'Pending',
    createdAt: daysAgo(3),
    updatedAt: daysAgo(3)
    // No lastOfficialUpdateAt → Response Delayed (and High + 24h)
  },
  {
    complaintText: 'Street light pole is bent and may fall. Danger to pedestrians.',
    location: 'Market Road, near bus stop',
    department: 'Electricity',
    basePriority: 'High',
    priority: 'High',
    priorityReason: 'Public safety hazard',
    status: 'Pending',
    createdAt: daysAgo(4),
    updatedAt: daysAgo(4)
    // No lastOfficialUpdateAt → Response Delayed
  },
  {
    complaintText: 'Road repair work started but left incomplete. Debris and dug-up area for over a week.',
    location: 'Link Road, Sector 7',
    department: 'Roads',
    basePriority: 'Medium',
    priority: 'Medium',
    priorityReason: 'Incomplete work causing inconvenience',
    status: 'In Progress',
    createdAt: daysAgo(10),
    updatedAt: daysAgo(6),
    lastOfficialUpdateAt: daysAgo(6)
    // Last official update 6 days ago → Resolution Delayed
  },
  {
    complaintText: 'Drainage cleaning was requested but no team has visited. Water logging continues.',
    location: 'Garden Colony, Lane 2',
    department: 'Drainage',
    basePriority: 'Medium',
    priority: 'Medium',
    priorityReason: 'Recurring drainage issue',
    status: 'Pending',
    createdAt: daysAgo(5),
    updatedAt: daysAgo(5)
    // No response > 48 hours → Response Delayed
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

    // Create all-departments × all-priorities complaints (Roads, Electricity, Drainage, Sanitation × High, Medium, Low)
    const allDeptWithCitizen = allDepartmentsComplaints.map(complaint => ({
      ...complaint,
      citizenId: citizen._id
    }));
    const createdAllDept = await Complaint.create(allDeptWithCitizen);
    console.log(`Created ${createdAllDept.length} all-departments complaints (High/Medium/Low per department)`);

    // Create escalation-demo complaints (backdated so they trigger escalation rules)
    const escalationWithCitizen = escalationDemoComplaints.map(complaint => ({
      ...complaint,
      citizenId: citizen._id
    }));
    const createdEscalation = await Complaint.create(escalationWithCitizen);
    console.log(`Created ${createdEscalation.length} escalation-demo complaints`);

    // Run escalation check so admin dashboard shows alerts immediately
    const escalationResult = await checkEscalations();
    console.log(`Escalation check: ${escalationResult.updated} updated, ${escalationResult.escalated} escalated`);

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
    console.log('\nAll departments: Roads, Electricity, Drainage, Sanitation each have High/Medium/Low complaints (Pending, In Progress, Resolved).');
    console.log('Escalation demo: Log in as admin@test.com → Escalation Alerts to see example escalated complaints.');

    console.log('\n✅ Database seeded successfully!');
    process.exit(0);

  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
