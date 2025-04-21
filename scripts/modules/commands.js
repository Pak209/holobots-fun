const { program } = require('commander');
const path = require('path');
const fs = require('fs');
const { Configuration, OpenAIApi } = require('openai');

// Initialize OpenAI configuration
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

// Utility function to read PRD document
const readPRDDocument = async (filePath) => {
  try {
    const absolutePath = path.resolve(process.cwd(), filePath);
    const content = await fs.promises.readFile(absolutePath, 'utf8');
    return content.trim();
  } catch (error) {
    throw new Error(`Failed to read PRD document: ${error.message}`);
  }
};

// Function to generate tasks using OpenAI
const generateTasks = async (prdContent, numTasks) => {
  try {
    const prompt = `Based on the following Product Requirements Document, generate ${numTasks} high-level development tasks. Format the output as a JSON array of tasks, where each task has a title, description, and priority (high, medium, or low).\n\nPRD:\n${prdContent}`;

    const response = await openai.createCompletion({
      model: "gpt-3.5-turbo",
      prompt,
      max_tokens: 2000,
      temperature: 0.7,
    });

    const tasks = JSON.parse(response.data.choices[0].text);
    return tasks;
  } catch (error) {
    throw new Error(`Failed to generate tasks: ${error.message}`);
  }
};

// Function to save tasks to file
const saveTasks = async (tasks, outputPath, force = false) => {
  try {
    const absolutePath = path.resolve(process.cwd(), outputPath);
    
    // Check if file exists and force flag is not set
    if (fs.existsSync(absolutePath) && !force) {
      throw new Error('Tasks file already exists. Use --force to overwrite.');
    }

    // Ensure directory exists
    const dir = path.dirname(absolutePath);
    await fs.promises.mkdir(dir, { recursive: true });

    // Save tasks
    await fs.promises.writeFile(
      absolutePath,
      JSON.stringify({ tasks }, null, 2),
      'utf8'
    );
  } catch (error) {
    throw new Error(`Failed to save tasks: ${error.message}`);
  }
};

// Initialize CLI program
program
  .version('0.1.0')
  .description('Task Master CLI for managing development tasks');

// Parse command
program
  .command('parse')
  .description('Parse a PRD document to generate tasks')
  .option('-i, --input <path>', 'Path to PRD document', 'scripts/prd.txt')
  .option('-o, --output <path>', 'Output path for tasks.json', 'tasks/tasks.json')
  .option('-n, --num-tasks <number>', 'Number of tasks to generate', '10')
  .option('-f, --force', 'Force overwrite existing tasks.json')
  .action(async (options) => {
    try {
      console.log('Reading PRD document...');
      const prdContent = await readPRDDocument(options.input);

      console.log('Generating tasks...');
      const tasks = await generateTasks(prdContent, parseInt(options.numTasks, 10));

      console.log('Saving tasks...');
      await saveTasks(tasks, options.output, options.force);

      console.log('Tasks generated successfully!');
    } catch (error) {
      console.error('Error:', error.message);
      process.exit(1);
    }
  });

// Export runCLI function
const runCLI = () => {
  program.parse(process.argv);
};

module.exports = { runCLI };
