/**
 * Preservation Property Tests
 * 
 * These tests verify that existing configurations remain unchanged after the fix.
 * They should PASS on unfixed code to confirm baseline behavior to preserve.
 * 
 * **Validates: Requirements 3.1, 3.2**
 */

const path = require('path');
const fs = require('fs');

const BACKEND_DIR = path.join(__dirname, '..');

describe('Preservation: Package Scripts Unchanged', () => {
  
  it('should have dev script defined in package.json', () => {
    const packageJson = JSON.parse(fs.readFileSync(path.join(BACKEND_DIR, 'package.json'), 'utf-8'));
    expect(packageJson.scripts).toHaveProperty('dev');
    expect(packageJson.scripts.dev).toBe('nodemon index.js');
  });

  it('should have start script defined in package.json', () => {
    const packageJson = JSON.parse(fs.readFileSync(path.join(BACKEND_DIR, 'package.json'), 'utf-8'));
    expect(packageJson.scripts).toHaveProperty('start');
    expect(packageJson.scripts.start).toBe('node index.js');
  });

  it('should have test script defined in package.json', () => {
    const packageJson = JSON.parse(fs.readFileSync(path.join(BACKEND_DIR, 'package.json'), 'utf-8'));
    expect(packageJson.scripts).toHaveProperty('test');
  });
});

describe('Preservation: Dependencies Unchanged', () => {
  
  it('should have nodemon in devDependencies', () => {
    const packageJson = JSON.parse(fs.readFileSync(path.join(BACKEND_DIR, 'package.json'), 'utf-8'));
    expect(packageJson.devDependencies).toHaveProperty('nodemon');
  });
});

describe('Preservation: Supabase Configuration Unchanged', () => {
  
  it('should have Supabase migrations directory', () => {
    const migrationsDir = path.join(BACKEND_DIR, 'supabase', 'migrations');
    expect(fs.existsSync(migrationsDir)).toBe(true);
    expect(fs.statSync(migrationsDir).isDirectory()).toBe(true);
  });

  it('should have Supabase functions directory', () => {
    const functionsDir = path.join(BACKEND_DIR, 'supabase', 'functions');
    expect(fs.existsSync(functionsDir)).toBe(true);
    expect(fs.statSync(functionsDir).isDirectory()).toBe(true);
  });
});