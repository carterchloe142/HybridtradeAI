"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireRole = requireRole;
exports.requireRoleOrResponse = requireRoleOrResponse;
const next_auth_1 = require("next-auth");
const server_1 = require("next/server");
async function requireRole(required, authOptions) {
    const session = authOptions ? await (0, next_auth_1.getServerSession)(authOptions) : await next_auth_1.getServerSession();
    const user = session?.user;
    if (!user)
        return { user: null, error: 'unauthenticated' };
    const role = (user.role ?? 'USER');
    if (required === 'ADMIN' && role !== 'ADMIN')
        return { user: null, error: 'forbidden' };
    return { user, error: null };
}
async function requireRoleOrResponse(required, authOptions) {
    const session = authOptions ? await (0, next_auth_1.getServerSession)(authOptions) : await next_auth_1.getServerSession();
    const user = session?.user;
    if (!user)
        return server_1.NextResponse.json({ error: 'unauthenticated' }, { status: 401 });
    const role = (user.role ?? 'USER');
    if (required === 'ADMIN' && role !== 'ADMIN')
        return server_1.NextResponse.json({ error: 'forbidden' }, { status: 403 });
    return { user };
}
