import { isUuidLike, isEmailLike, resolveSupabaseUserId } from '../pages/api/admin/credit-user'

// Mock supabaseServer
jest.mock('../lib/supabaseServer', () => {
  return {
    supabaseServer: {
      from: jest.fn((table) => {
        const chain = {
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          maybeSingle: jest.fn().mockImplementation(() => {
            // Return success for the specific test UUID in User/users table
            if (table === 'User' || table === 'users') {
               return Promise.resolve({ 
                 data: { id: '123e4567-e89b-12d3-a456-426614174000' }, 
                 error: null 
               })
            }
            return Promise.resolve({ data: null, error: null })
          })
        }
        return chain
      }),
      auth: {
        admin: {
          getUserById: jest.fn().mockResolvedValue({ data: null, error: 'not found' }),
          listUsers: jest.fn().mockResolvedValue({ data: { users: [] } })
        }
      }
    }
  }
})

describe('manual credit resolver utils', () => {
  test('isUuidLike detects UUID v4', () => {
    expect(isUuidLike('123e4567-e89b-12d3-a456-426614174000')).toBe(true)
    expect(isUuidLike(' 123e4567-e89b-12d3-a456-426614174000 ')).toBe(true)
  })

  test('isEmailLike trims and detects emails', () => {
    expect(isEmailLike('user@example.com')).toBe(true)
    expect(isEmailLike('  user@example.com  ')).toBe(true)
    expect(isEmailLike('notanemail')).toBe(false)
  })

  test('resolveSupabaseUserId returns UUID unchanged', async () => {
    const id = '123e4567-e89b-12d3-a456-426614174000'
    await expect(resolveSupabaseUserId({ userId: id, email: '' })).resolves.toBe(id)
    await expect(resolveSupabaseUserId({ userId: `  ${id}  `, email: '' })).resolves.toBe(id)
  })
})
