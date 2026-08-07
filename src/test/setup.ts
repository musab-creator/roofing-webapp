import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

afterEach(() => {
  cleanup();
});

vi.stubEnv('REACT_APP_SUPABASE_URL', 'http://localhost:54321');
vi.stubEnv('REACT_APP_SUPABASE_KEY', 'test-anon-key');
