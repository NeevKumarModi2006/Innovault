/**
 * QStash Client Configuration
 * ─────────────────────────────
 * Initializes the Upstash QStash client for serverless event messaging.
 * QStash replaces the deprecated Upstash Kafka service.
 *
 * HIGH COHESION: Only manages QStash client instantiation.
 * LOW COUPLING:  The producer module imports the client without
 *                knowing auth/endpoint details.
 *
 * Graceful bypass: If QSTASH_TOKEN is not set, client is null.
 *                  The producer checks this before publishing.
 */

const { Client } = require('@upstash/qstash');

let qstashClient = null;
let isConfigured = false;

const token = process.env.QSTASH_TOKEN;

if (token) {
    qstashClient = new Client({ token });
    isConfigured = true;
    console.log('📨 QStash client configured (Upstash).');
} else {
    console.warn('⚠️  QSTASH_TOKEN not set — event messaging disabled.');
}

module.exports = { qstashClient, isConfigured };
