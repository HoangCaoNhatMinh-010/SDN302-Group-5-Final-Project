console.error(
  '[Seed] Disabled: test users must not be written to the configured store database. ' +
  'Use isolated fixtures with a dedicated test database.'
);
process.exitCode = 1;
