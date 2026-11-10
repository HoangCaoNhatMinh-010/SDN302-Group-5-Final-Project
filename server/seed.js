console.error(
  '[Seed] Disabled: the configured database may contain imported store data. ' +
  'Use a separate, disposable test database and create test records explicitly.'
);
process.exitCode = 1;
