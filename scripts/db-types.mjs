import { execFileSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';
// Use an installed Supabase CLI. Write only after generation succeeds.
try {
  const output = execFileSync('supabase', ['gen', 'types', 'typescript', '--linked'], { encoding: 'utf8', stdio: ['inherit', 'pipe', 'inherit'] });
  if (!output.includes('export type Database')) throw new Error('Supabase returned no Database type.');
  writeFileSync(new URL('../src/lib/database.types.ts', import.meta.url), output);
} catch {
  console.error('Type generation failed. Install the Supabase CLI and run supabase link first. Existing types were preserved.');
  process.exitCode = 1;
}

