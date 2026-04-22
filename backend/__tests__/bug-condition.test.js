/**
 * Bug Condition Exploration Test
 * 
 * This test verifies the expected behavior: backend/index.js should exist and work
 * 
 * **Validates: Requirements 1.1, 1.2, 1.3**
 * 
 * CRITICAL: This test MUST FAIL on unfixed code - failure confirms the bug exists
 * The test encodes the expected behavior - it will validate the fix when it passes after implementation
 */

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const BACKEND_DIR = path.join(__dirname, '..');

describe('Expected Behavior: Backend Entry Point Exists and Works', () => {
  
  it('should have backend/index.js file exist', () => {
    const indexPath = path.join(BACKEND_DIR, 'index.js');
    const fileExists = fs.existsSync(indexPath);
    
    // Expected behavior: index.js should exist
    // On unfixed code: file doesn't exist, test FAILS (confirms bug)
    // After fix: file exists, test PASSES
    expect(fileExists).toBe(true);
  });

  it('should successfully run node index.js without errors', () => {
    try {
      const output = execSync('node index.js', { 
        cwd: BACKEND_DIR, 
        encoding: 'utf-8',
        stdio: 'pipe',
        timeout: 5000
      });
      
      // Expected behavior: should run without errors
      // On unfixed code: throws "Cannot find module", test FAILS (confirms bug)
      // After fix: runs successfully, test PASSES
      expect(output).toContain('Backend ready');
    } catch (error) {
      // On unfixed code, this catches the "Cannot find module" error
      // The test FAILS because we expected it to work
      fail(`Expected node index.js to work, but got error: ${error.message}`);
    }
  });

  it('should successfully run npm run dev without module errors', () => {
    try {
      const output = execSync('npm run dev', { 
        cwd: BACKEND_DIR, 
        encoding: 'utf-8',
        stdio: 'pipe',
        timeout: 8000
      });
      
      // Expected behavior: npm run dev should start without module errors
      // On unfixed code: fails with module error, test FAILS (confirms bug)
      // After fix: starts successfully, test PASSES
      expect(output).not.toMatch(/Cannot find module/);
    } catch (error) {
      // nodemon may exit after starting (normal behavior in non-interactive context)
      // Check if the output shows successful startup before the exit
      const output = (error.stdout || '') + (error.stderr || '');
      
      // If we see "Backend ready" in output, the server started successfully
      // The exit is just nodemon doing its normal thing
      if (output.includes('Backend ready')) {
        expect(output).not.toMatch(/Cannot find module/);
      } else {
        // Genuine error - no "Backend ready" means it failed
        const errorOutput = error.stderr || error.stdout || error.message;
        throw new Error(`Expected npm run dev to work, but got error: ${errorOutput}`);
      }
    }
  });
});