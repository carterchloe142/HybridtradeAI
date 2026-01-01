import { supabaseServer, supabaseServiceReady } from './supabaseServer'

export type Role = 'USER' | 'ADMIN'

export async function requireRole(
  required: Role,
  req?: Request
): Promise<{ user: any | null; error: 'unauthenticated' | 'forbidden' | null }> {
  try {
    let token = ''
    
    if (req) {
      const authHeader = req.headers.get('authorization')
      token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7).trim() : ''
    }
    
    if (!token) {
      return { user: null, error: 'unauthenticated' }
    }
    
    const { data, error } = await supabaseServer.auth.getUser(token)
    if (error || !data?.user) {
      return { user: null, error: 'unauthenticated' }
    }
    
    const user = data.user as any
    
    if (required === 'ADMIN') {
      const { data: profile } = await supabaseServer
        .from('profiles')
        .select('role,is_admin')
        .eq('user_id', user.id)
        .maybeSingle()
      
      const role = String(profile?.role || '').toLowerCase()
      const isAdmin = Boolean(profile?.is_admin) || role === 'admin'
      
      if (!isAdmin) {
        return { user: null, error: 'forbidden' }
      }
    }
    
    return { user, error: null }
  } catch {
    return { user: null, error: 'unauthenticated' }
  }
}
