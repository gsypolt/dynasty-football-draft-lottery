import { beforeEach } from 'vitest';

// Add test type to test context based on filename
beforeEach((context) => {
  const testPath = context.task.file?.name || '';

  if (testPath.includes('.unit.test.')) {
    context.task.meta = { ...context.task.meta, type: '[UNIT]' };
  } else if (testPath.includes('.ui.test.')) {
    context.task.meta = { ...context.task.meta, type: '[UI]' };
  } else if (testPath.includes('.api.test.')) {
    context.task.meta = { ...context.task.meta, type: '[API]' };
  } else if (testPath.includes('.integration.test.')) {
    context.task.meta = { ...context.task.meta, type: '[INTEGRATION]' };
  } else {
    context.task.meta = { ...context.task.meta, type: '[TEST]' };
  }
});
