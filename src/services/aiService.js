const responses = [
  "I'm Grok, an AI assistant. I can help you with various tasks, answer questions, and have conversations!",
  "That's an interesting question! Let me think about that...",
  "I'd be happy to help you with that. What specific aspect would you like to know more about?",
  "Great question! Here's what I can tell you about that topic...",
  "I understand what you're asking. Let me provide some insights on that.",
  "That's a fascinating topic! From my perspective...",
  "I can definitely assist you with that. Here's my take...",
  "Good question! Based on what I know...",
  "Let me break that down for you in a helpful way.",
  "I appreciate you asking! Here's how I'd approach this..."
];

const contextResponses = {
  'hello': "Hello! I'm Grok, your AI assistant. How can I help you today?",
  'hi': "Hi there! What can I do for you?",
  'hey': "Hey! Ready to assist you. What's on your mind?",
  'help': "I'm here to help! I can answer questions, provide information, have conversations, help with writing, coding, analysis, and much more. What would you like to know?",
  'who are you': "I'm Grok, an AI assistant designed to help you with a wide range of tasks. I can answer questions, provide information, assist with problem-solving, and engage in meaningful conversations.",
  'what can you do': "I can help with many things: answering questions, providing explanations, helping with writing and editing, assisting with code, analyzing information, brainstorming ideas, and much more! What do you need help with?",
  'code': "I'd be happy to help with coding! What programming language or problem are you working on?",
  'write': "I can help you write! What kind of content do you need - an article, essay, story, email, or something else?",
  'thanks': "You're welcome! Is there anything else I can help you with?",
  'thank you': "My pleasure! Feel free to ask if you need anything else.",
  'bye': "Goodbye! Feel free to come back anytime you need assistance.",
  'explain': "I'd be glad to explain that! What topic would you like me to break down for you?",
};

export const generateAIResponse = async (userMessage) => {
  return new Promise((resolve) => {
    const delay = 1000 + Math.random() * 1500;

    setTimeout(() => {
      const lowerMessage = userMessage.toLowerCase().trim();

      let response = null;

      for (const [key, value] of Object.entries(contextResponses)) {
        if (lowerMessage.includes(key)) {
          response = value;
          break;
        }
      }

      if (!response) {
        if (lowerMessage.includes('?')) {
          response = `That's a great question about "${userMessage}". ${responses[Math.floor(Math.random() * responses.length)]} While I'm a demo version, I can tell you that this is an interesting topic worth exploring further.`;
        } else if (lowerMessage.split(' ').length > 10) {
          response = `I see you've shared quite a bit there. ${responses[Math.floor(Math.random() * responses.length)]} In a full version, I would provide detailed analysis and insights on what you've mentioned.`;
        } else {
          response = responses[Math.floor(Math.random() * responses.length)];
        }
      }

      resolve(response);
    }, delay);
  });
};

export const generateStreamingResponse = async (userMessage, onChunk) => {
  const response = await generateAIResponse(userMessage);
  const words = response.split(' ');

  for (let i = 0; i < words.length; i++) {
    await new Promise(resolve => setTimeout(resolve, 50 + Math.random() * 50));
    onChunk(words.slice(0, i + 1).join(' '));
  }

  return response;
};
