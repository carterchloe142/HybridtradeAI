import { isUuidLike, isEmailLike, resolveSupabaseUserId } from '../pages/api/admin/credit-user';

// Mock supabaseServer
jest.mock('@/src/lib/supabaseServer', () => ({
  supabaseServer: {
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          maybeSingle: jest.fn().mockResolvedValue({ data: { id: 'mock-uuid-1234' }, error: null })
        }))
      }))
    }))
  }
}));

describe('Credit User Utils', () => {
  test('isUuidLike validates UUIDs correctly', () => {
    expect(isUuidLike('123e4567-e89b-12d3-a456-426614174000')).toBe(true);
    expect(isUuidLike('invalid-uuid')).toBe(false);
  });

  test('isEmailLike validates emails correctly', () => {
    expect(isEmailLike('test@example.com')).toBe(true);
    expect(isEmailLike('invalid-email')).toBe(false);
  });

  test('resolveSupabaseUserId returns userId if UUID provided', async () => {
    const id = '123e4567-e89b-12d3-a456-426614174000';
    const result = await resolveSupabaseUserId({ userId: id });
    expect(result).toBe(id);
  });
  
  // Note: Testing resolveSupabaseUserId with email requires mocking supabase, which we did above.
  test('resolveSupabaseUserId resolves email to UUID', async () => {
    const result = await resolveSupabaseUserId({ email: 'test@example.com' });
    expect(result).toBe('mock-uuid-1234');
  });
});
