const { spawn } = require('child_process');

// Filter function to suppress HMR ping errors
function shouldSuppressLine(line) {
  if (!line || !line.trim()) return false;
  
  const lowerLine = line.toLowerCase();
  // Match the specific HMR ping error pattern
  // Pattern 1: [Error: unrecognized HMR message "{"event":"ping"}"]
  // Pattern 2: ⨯ unhandledRejection: [Error: unrecognized HMR message "{"event":"ping"}"]
  const hasHmrError = lowerLine.includes('unrecognized hmr message');
  const hasPingEvent = lowerLine.includes('"event":"ping"') || 
                       lowerLine.includes('event":"ping"');
  
  // Also check for unhandledRejection that mentions HMR ping
  const hasUnhandledRejection = lowerLine.includes('unhandledrejection');
  const mentionsHmrPing = hasHmrError && hasPingEvent;
  
  // Suppress if it's the HMR ping error or unhandled rejection about HMR ping
  return mentionsHmrPing || (hasUnhandledRejection && mentionsHmrPing);
}

// Buffer for incomplete lines
let stdoutBuffer = '';
let stderrBuffer = '';

// Start Next.js dev server with filtered output
const child = spawn('next', ['dev', '--turbopack'], {
  shell: true,
  stdio: ['inherit', 'pipe', 'pipe'],
});

// Handle stdout with buffering for multi-line messages
child.stdout.on('data', (data) => {
  stdoutBuffer += data.toString();
  const lines = stdoutBuffer.split('\n');
  stdoutBuffer = lines.pop() || ''; // Keep incomplete line in buffer
  
  for (const line of lines) {
    if (line.trim() && !shouldSuppressLine(line)) {
      process.stdout.write(line + '\n');
    }
  }
});

// Handle stderr with buffering for multi-line messages
child.stderr.on('data', (data) => {
  stderrBuffer += data.toString();
  const lines = stderrBuffer.split('\n');
  stderrBuffer = lines.pop() || ''; // Keep incomplete line in buffer
  
  for (const line of lines) {
    if (line.trim() && !shouldSuppressLine(line)) {
      process.stderr.write(line + '\n');
    }
  }
});

// Handle unhandled rejections in this process
process.on('unhandledRejection', (error) => {
  const errorMessage = error?.message || String(error);
  if (shouldSuppressLine(errorMessage)) {
    return; // Suppress HMR ping errors
  }
  // Log other unhandled rejections
  console.error('Unhandled rejection:', error);
});

child.on('exit', (code) => {
  process.exit(code);
});

// Forward signals
process.on('SIGINT', () => {
  child.kill('SIGINT');
});

process.on('SIGTERM', () => {
  child.kill('SIGTERM');
});

