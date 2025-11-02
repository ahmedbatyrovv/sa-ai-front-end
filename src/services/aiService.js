export async function generateStreamingResponse(prompt, onChunk) {
  const responses = [
    "I'm SA-AI, your intelligent assistant. How can I help you today?",
    "That's a great question! Let me think about that...",
    "I understand what you're asking. Here's my perspective...",
    "Based on my understanding, I can help you with that.",
    "Let me provide you with a comprehensive answer to your query.",
  ];

  const randomResponse = responses[Math.floor(Math.random() * responses.length)];
  const words = randomResponse.split(' ');

  for (let i = 0; i < words.length; i++) {
    await new Promise(resolve => setTimeout(resolve, 50));
    const chunk = words.slice(0, i + 1).join(' ');
    onChunk(chunk);
  }

  return randomResponse;
}
