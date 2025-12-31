"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.supabaseServer = exports.supabaseServiceReady = void 0;
const supabase_js_1 = require("@supabase/supabase-js");
const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
exports.supabaseServiceReady = Boolean(url && serviceKey);
function createDisabledClient() {
    const err = async () => { throw new Error('supabase_service_not_configured'); };
    const from = () => ({
        select: err,
        insert: err,
        update: err,
        delete: err,
        eq: () => ({ select: err, insert: err, update: err, delete: err }),
        order: () => ({ select: err }),
        range: () => ({ select: err }),
        maybeSingle: err,
    });
    return { auth: { getUser: err }, from };
}
exports.supabaseServer = exports.supabaseServiceReady ? (0, supabase_js_1.createClient)(url, serviceKey) : createDisabledClient();
