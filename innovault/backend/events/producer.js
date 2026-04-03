/**
 * Event Producer (QStash)
 * ────────────────────────
 * Publishes domain events via Upstash QStash serverless messaging.
 * Replaces the deprecated Upstash Kafka service.
 *
 * HIGH COHESION: Only manages event publishing.
 * LOW COUPLING:  Routes call publishEvent() without knowing QStash internals.
 *                The function signature is identical to the old Kafka producer,
 *                so zero changes are needed in route files.
 *
 * Graceful bypass: If QStash is not configured, publishEvent is a no-op.
 *
 * Events are published to a callback URL (QSTASH_RECEIVER_URL) which can
 * be your own backend endpoint, a logging service, or any webhook.
 * If no receiver URL is set, events are published to QStash's built-in
 * topic system for later consumption.
 */

const { qstashClient, isConfigured } = require('../config/qstashClient');

/**
 * Publish a domain event via QStash.
 * Fire-and-forget — errors are logged, never thrown.
 *
 * @param {string} eventType  e.g. 'PROJECT_CREATED', 'REVIEW_ADDED'
 * @param {object} payload    event data
 */
async function publishEvent(eventType, payload) {
    if (!isConfigured || !qstashClient) return;

    const eventData = {
        eventType,
        timestamp: new Date().toISOString(),
        data: payload,
    };

    try {
        const receiverUrl = process.env.QSTASH_RECEIVER_URL;

        if (receiverUrl) {
            // Publish to a specific webhook/receiver endpoint
            await qstashClient.publishJSON({
                url: receiverUrl,
                body: eventData,
                retries: 3,
                headers: {
                    'x-event-type': eventType,
                    'Upstash-Forward-Bypass-Tunnel-Reminder': 'true'
                },
            });
        } else {
            // Publish to a QStash topic (fan-out to multiple subscribers)
            await qstashClient.publishJSON({
                topic: 'innovault-events',
                body: eventData,
                retries: 3,
                headers: {
                    'x-event-type': eventType,
                },
            });
        }

        console.log(`[qstash] Published → ${eventType}`);
    } catch (err) {
        console.error(`[qstash] Publish failed (${eventType}):`, err.message);
    }
}

/**
 * Graceful disconnect (QStash is HTTP-based, so nothing to disconnect).
 * Kept for interface compatibility with server.js shutdown hooks.
 */
async function disconnectProducer() {
    // QStash is stateless HTTP — no persistent connections to close.
    console.log('📨 QStash producer: no persistent connection to close.');
}

module.exports = { publishEvent, disconnectProducer };
