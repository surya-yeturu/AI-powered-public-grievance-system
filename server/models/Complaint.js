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
  mapLocationUrl: {
    type: String,
    default: null,
    trim: true
  },
  department: {
    type: String,
    enum: ['Roads', 'Electricity', 'Drainage', 'Sanitation'],
    required: [true, 'Department is required']
  },
  // Base priority from AI + rules (High/Medium/Low). Kept in sync with priority for backward compatibility.
  basePriority: {
    type: String,
    enum: ['High', 'Medium', 'Low'],
    default: 'Medium'
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
  // Dynamic priority score: baseScore + aging + location bonus. Recalculated on fetch/update.
  priorityScore: {
    type: Number,
    default: 0
  },
  lastScoreUpdatedAt: {
    type: Date,
    default: Date.now
  },
  // Explainability: set when rules override AI (e.g. sensitive location, duration)
  escalatedByRules: {
    type: Boolean,
    default: false
  },
  sensitiveLocation: {
    type: Boolean,
    default: false
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
  progressUpdates: [
    {
      status: { type: String, enum: ['In Progress', 'Resolved'], required: true },
      images: [{ type: String, trim: true }],
      remarks: { type: String, default: '', trim: true },
      updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
      updatedAt: { type: Date, default: Date.now }
    }
  ],
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
  },
  // Escalation & admin oversight (system-driven; officials cannot modify)
  lastOfficialUpdateAt: {
    type: Date,
    default: null
  },
  escalationLevel: {
    type: String,
    enum: ['None', 'Response Delayed', 'Resolution Delayed'],
    default: 'None'
  },
  escalatedAt: {
    type: Date,
    default: null
  },
  escalatedToAdmin: {
    type: Boolean,
    default: false
  },
  adminNotes: [
    {
      text: { type: String, required: true, trim: true },
      addedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
      addedAt: { type: Date, default: Date.now }
    }
  ],
  followUpInitiatedAt: {
    type: Date,
    default: null
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
