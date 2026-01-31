const OpenAI = require('openai');

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

/**
 * Classify complaint using OpenAI API
 * Returns department, priority, and reasoning
 */
exports.classifyComplaint = async (complaintText) => {
  try {
    // Construct the prompt for OpenAI
    const prompt = `You are an AI assistant for a smart city grievance system.
Given a citizen complaint, identify:
1. Relevant department (Roads, Electricity, Drainage, Sanitation)
2. Priority level (High, Medium, Low)
3. Short reason for the priority

Return ONLY valid JSON in this format:
{
  "department": "",
  "priority": "",
  "reason": ""
}

Complaint:
${complaintText}`;

    // Call OpenAI API (gpt-4o-mini for classification)
    const model = process.env.OPENAI_MODEL || 'gpt-4o-mini';
    const response = await openai.chat.completions.create({
      model,
      messages: [
        {
          role: 'system',
          content: 'You are a helpful assistant that classifies civic complaints. Always respond with valid JSON only.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.3, // Lower temperature for more consistent results
      max_tokens: 200,
      response_format: { type: "json_object" } // Ensure JSON response
    });

    // Extract the response content
    const content = response.choices[0].message.content;
    
    // Parse JSON response
    const classification = JSON.parse(content);

    // Validate the response structure
    if (!classification.department || !classification.priority || !classification.reason) {
      throw new Error('Invalid classification response from OpenAI');
    }

    // Validate department values
    const validDepartments = ['Roads', 'Electricity', 'Drainage', 'Sanitation'];
    if (!validDepartments.includes(classification.department)) {
      // Default to closest match or Roads
      classification.department = 'Roads';
    }

    // Validate priority values
    const validPriorities = ['High', 'Medium', 'Low'];
    if (!validPriorities.includes(classification.priority)) {
      // Default to Medium if invalid
      classification.priority = 'Medium';
    }

    return {
      success: true,
      data: {
        department: classification.department,
        priority: classification.priority,
        reason: classification.reason
      }
    };

  } catch (error) {
    console.error('OpenAI Classification Error:', error.message);
    
    // Return fallback classification if OpenAI fails
    return {
      success: false,
      data: {
        department: 'Roads', // Default department
        priority: 'Medium', // Default priority
        reason: 'Auto-classified due to AI service error. Please review manually.'
      },
      error: error.message
    };
  }
};

/**
 * Test OpenAI connection
 */
exports.testConnection = async () => {
  try {
    const model = process.env.OPENAI_MODEL || 'gpt-4o-mini';
    const response = await openai.chat.completions.create({
      model,
      messages: [{ role: 'user', content: 'Hello' }],
      max_tokens: 5
    });
    return { success: true, message: 'OpenAI connection successful' };
  } catch (error) {
    return { success: false, message: error.message };
  }
};
