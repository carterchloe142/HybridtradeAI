"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logError = exports.logWarn = exports.logInfo = exports.logDebug = void 0;
function baseLog(level, event, meta) {
    const payload = {
        level,
        event,
        ts: new Date().toISOString(),
        ...meta,
    };
    // Single-line JSON for easy ingestion by log processors
    // eslint-disable-next-line no-console
    console.log(JSON.stringify(payload));
}
const logDebug = (event, meta) => baseLog('debug', event, meta);
exports.logDebug = logDebug;
const logInfo = (event, meta) => baseLog('info', event, meta);
exports.logInfo = logInfo;
const logWarn = (event, meta) => baseLog('warn', event, meta);
exports.logWarn = logWarn;
const logError = (event, meta) => baseLog('error', event, meta);
exports.logError = logError;
