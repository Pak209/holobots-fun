
// Remove shebang and ensure proper module format
/**
 * dev.js
 * Task Master CLI - AI-driven development task management
 *
 * This is the refactored entry point that uses the modular architecture.
 * It imports functionality from the modules directory and provides a CLI.
 */

// Add at the very beginning of the file
if (process.env.DEBUG === '1') {
	console.error('DEBUG - dev.js received args:', process.argv.slice(2));
}

// Use CommonJS require instead of ESM import to match the exported module format
const { runCLI } = require('./modules/commands.js');

// Run the CLI with the process arguments
runCLI(process.argv);
