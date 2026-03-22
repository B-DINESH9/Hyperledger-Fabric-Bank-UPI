const crypto = require('crypto');
const { blockchainService } = require('./blockchainService');

// In-memory store for MFA challenges
// challengeID -> { question, expectedAnswer, type, n, context, expiresAt, attempts }
const challenges = new Map();

const MAX_ATTEMPTS = 3;
const CHALLENGE_TTL_MS = 2 * 60 * 1000; // 2 minutes

function cleanupExpired() {
  const now = Date.now();
  for (const [id, ch] of challenges.entries()) {
    if (new Date(ch.expiresAt).getTime() <= now) {
      challenges.delete(id);
    }
  }
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function lettersOnly(str) {
  return (str || '').replace(/[^a-zA-Z]/g, '');
}

function digitsOnly(str) {
  return (str || '').replace(/\D/g, '');
}

function rupeeIntegerDigits(amount) {
  const str = String(amount);
  const integerPart = str.split('.')[0];
  return digitsOnly(integerPart);
}

async function createChallenge({ fromUPIID, toUPIID, amount, deviceID, ipAddress }) {
  cleanupExpired();

  let recipientName = '';
  try {
    const acct = await blockchainService.getAccount(toUPIID);
    recipientName = acct.name || (toUPIID.split('@')[0] || '');
  } catch (_) {
    recipientName = toUPIID.split('@')[0] || '';
  }

  const choices = ['AMOUNT_DIGIT_SUM', 'RECIPIENT_NAME_PREFIX', 'UPI_ID_LAST_DIGITS'];
  let type = choices[randomInt(0, choices.length - 1)];
  let question = '';
  let expectedAnswer = '';
  let n = 0;

  const buildAmountSum = () => {
    const digits = rupeeIntegerDigits(amount);
    const sum = digits.split('').reduce((s, d) => s + parseInt(d, 10), 0);
    question = `Enter the sum of digits in ₹ ${Number(amount).toLocaleString('en-IN')}`;
    expectedAnswer = String(sum);
    n = digits.length;
    type = 'AMOUNT_DIGIT_SUM';
  };

  const buildNamePrefix = () => {
    const letters = lettersOnly(recipientName);
    if (letters.length === 0) return buildAmountSum();
    const maxN = Math.max(1, Math.min(3, letters.length));
    n = randomInt(1, maxN);
    expectedAnswer = letters.substring(0, n).toLowerCase();
    question = `Input first ${n} letters of recipient's name`;
    type = 'RECIPIENT_NAME_PREFIX';
  };

  const buildUPILastDigits = () => {
    const digits = digitsOnly(toUPIID);
    if (digits.length === 0) {
      try {
        const acct = blockchainService.mockData?.accounts?.get(toUPIID);
        if (acct && acct.accountNumber) {
          const d2 = digitsOnly(String(acct.accountNumber));
          if (d2.length > 0) {
            const maxN = Math.min(4, d2.length);
            n = randomInt(2, maxN);
            expectedAnswer = d2.slice(-n);
            question = `Enter last ${n} digits of recipient UPI ID`;
            type = 'UPI_ID_LAST_DIGITS';
            return;
          }
        }
      } catch (_) {}
      return buildAmountSum();
    }
    const maxN = Math.min(4, digits.length);
    n = randomInt(2, maxN);
    expectedAnswer = digits.slice(-n);
    question = `Enter last ${n} digits of recipient UPI ID`;
    type = 'UPI_ID_LAST_DIGITS';
  };

  if (type === 'AMOUNT_DIGIT_SUM') buildAmountSum();
  if (type === 'RECIPIENT_NAME_PREFIX') buildNamePrefix();
  if (type === 'UPI_ID_LAST_DIGITS') buildUPILastDigits();
  if (!question || !expectedAnswer) buildAmountSum();

  const challengeID = `CHL_${Date.now()}_${crypto.randomBytes(6).toString('hex')}`;
  const expiresAt = new Date(Date.now() + CHALLENGE_TTL_MS).toISOString();

  const record = {
    question,
    expectedAnswer,
    type,
    n,
    context: {
      fromUPIID,
      toUPIID,
      amount: Number(amount),
      deviceID,
      ipAddress
    },
    expiresAt,
    attempts: 0
  };

  challenges.set(challengeID, record);

  return { challengeID, question, type, n, expiresAt };
}

function verifyChallenge({ challengeID, answer, context }) {
  cleanupExpired();
  const record = challenges.get(challengeID);
  if (!record) {
    return { ok: false, code: 'NOT_FOUND', message: 'Challenge not found or expired', attemptsLeft: 0 };
  }

  if (new Date(record.expiresAt).getTime() <= Date.now()) {
    challenges.delete(challengeID);
    return { ok: false, code: 'EXPIRED', message: 'Challenge expired', attemptsLeft: 0 };
  }

  const same = (
    record.context.fromUPIID === context.fromUPIID &&
    record.context.toUPIID === context.toUPIID &&
    Number(record.context.amount) === Number(context.amount) &&
    record.context.deviceID === context.deviceID
  );
  if (!same) {
    challenges.delete(challengeID);
    return { ok: false, code: 'CONTEXT_MISMATCH', message: 'Transaction details altered. Verification failed.', attemptsLeft: 0 };
  }

  const expected = record.expectedAnswer;
  const provided = String(answer || '');
  const isCorrect = record.type === 'RECIPIENT_NAME_PREFIX'
    ? provided.trim().toLowerCase() === expected
    : provided.trim() === expected;

  if (!isCorrect) {
    record.attempts += 1;
    const attemptsLeft = Math.max(0, MAX_ATTEMPTS - record.attempts);
    if (record.attempts >= MAX_ATTEMPTS) {
      challenges.delete(challengeID);
      return { ok: false, code: 'MAX_ATTEMPTS', message: 'Maximum attempts exceeded. Challenge invalidated.', attemptsLeft: 0 };
    } else {
      challenges.set(challengeID, record);
      return { ok: false, code: 'WRONG_ANSWER', message: 'Incorrect answer', attemptsLeft };
    }
  }

  challenges.delete(challengeID);
  return { ok: true };
}

module.exports = { createChallenge, verifyChallenge };