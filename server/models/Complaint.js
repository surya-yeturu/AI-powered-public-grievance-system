const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema({
  citizenId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Citizen ID is required']
  },
  complaintText: {
    type: String,
    required: [true, 'Complaint text is required'],
    trim: true,
    minlength: [10, 'Complaint must be at least 10 characters long']
  },
  imageUrl: {
    type: String,
    default: null,
    trim: true
  },
  location: {
    type: String,
    required: [true, 'Location is required'],
    trim: true
  },
  department: {
    type: String,
    enum: ['Roads', 'Electricity', 'Drainage', 'Sanitation'],
    required: [true, 'Department is required']
  },
  priority: {
    type: String,
    enum: ['High', 'Medium', 'Low'],
    required: [true, 'Priority is required']
  },
  priorityReason: {
    type: String,
    default: '',
    trim: true
  },
  status: {
    type: String,
    enum: ['Pending', 'In Progress', 'Resolved'],
    default: 'Pending'
  },
  resolutionRemarks: {
    type: String,
    default: '',
    trim: true
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt timestamp before saving
complaintSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Update the updatedAt timestamp before updating
complaintSchema.pre('findOneAndUpdate', function(next) {
  this.set({ updatedAt: Date.now() });
  next();
});

module.exports = mongoose.model('Complaint', complaintSchema);
