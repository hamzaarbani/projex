const { OpenAI } = require('openai');
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

exports.summarizeTask = async (text) => {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'Summarize the following task description in one sentence.' },
        { role: 'user', content: text },
      ],
      max_tokens: 50,
    });
    return response.choices[0].message.content.trim();
  } catch (error) {
    console.error('AI summarization error:', error);
    return null;
  }
};

exports.suggestPriority = async (title, description) => {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'Suggest priority (low, medium, high) based on urgency and importance. Respond with only one word.' },
        { role: 'user', content: `Title: ${title}. Description: ${description}` },
      ],
      max_tokens: 10,
    });
    return response.choices[0].message.content.trim().toLowerCase();
  } catch (error) {
    console.error('AI priority error:', error);
    return 'medium';
  }
};

exports.summarizeProjectProgress = async (projectName, tasks) => {
  const total = tasks.length;
  const done = tasks.filter(t => t.status === 'done').length;
  const progress = total > 0 ? Math.round((done / total) * 100) : 0;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'Write a one-sentence progress summary for this project.' },
        { role: 'user', content: `Project: ${projectName}. Tasks: ${done} of ${total} completed (${progress}%).` },
      ],
      max_tokens: 30,
    });
    return response.choices[0].message.content.trim();
  } catch (error) {
    console.error('AI progress error:', error);
    return `${done} of ${total} tasks completed (${progress}%)`;
  }
};