import crypto from 'crypto';

const STATE_TTL_MS = 10 * 60 * 1000; // 10 minutes — plenty for a user to complete the OAuth consent screen

function sign(userId, expires) {
  const secret = process.env.OAUTH_STATE_SECRET || '';
  return crypto.createHmac('sha256', secret).update(`${userId}.${expires}`).digest('hex');
}

function signState(userId) {
  const expires = Date.now() + STATE_TTL_MS;
  const sig = sign(userId, expires);
  return Buffer.from(JSON.stringify({ userId, expires, sig })).toString('base64url');
}

function verifyState(state) {
  try {
    const { userId, expires, sig } = JSON.parse(Buffer.from(state, 'base64url').toString('utf8'));
    if (!userId || !expires || !sig) return null;
    if (Date.now() > expires) return null;
    const expected = sign(userId, expires);
    if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null;
    return userId;
  } catch {
    return null;
  }
}

export { signState, verifyState };
