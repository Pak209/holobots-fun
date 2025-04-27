
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

// Use import statement instead of require for ES modules
import { runCLI } from './modules/commands.js';

// Run the CLI with the process arguments
runCLI(process.argv);
