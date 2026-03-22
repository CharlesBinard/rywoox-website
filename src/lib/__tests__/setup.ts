import { cleanup } from '@testing-library/react';
import { afterEach, expect } from 'vitest';
import '@testing-library/dom';

// Cleanup after each test
afterEach(() => {
  cleanup();
  localStorage.clear();
});

// Extend expect with custom matchers if needed
expect.extend({});
