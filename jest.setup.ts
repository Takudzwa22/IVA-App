import '@testing-library/jest-dom';

// Mock next/navigation
jest.mock('next/navigation', () => ({
    useRouter() {
        return {
            push: jest.fn(),
            replace: jest.fn(),
            prefetch: jest.fn(),
            back: jest.fn(),
        };
    },
    useSearchParams() {
        return new URLSearchParams();
    },
    usePathname() {
        return '/';
    },
}));

// Mock environment variables for tests
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';

// Suppress console warnings during tests (optional, remove if you want to see them)
const originalWarn = console.warn;
beforeAll(() => {
    console.warn = (...args: unknown[]) => {
        // Filter out specific warnings if needed
        if (typeof args[0] === 'string' && args[0].includes('[Supabase]')) {
            return;
        }
        originalWarn.apply(console, args);
    };
});

afterAll(() => {
    console.warn = originalWarn;
});
