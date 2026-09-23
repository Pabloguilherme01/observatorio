import assert from 'node:assert/strict';
import { generateKeyPairSync, sign } from 'node:crypto';
import { verifyCompactJws } from './verify-jws.mjs';

const { privateKey, publicKey } = generateKeyPairSync('rsa', { modulusLength: 2048 });
const header = Buffer.from(JSON.stringify({ alg: 'RS256', typ: 'JWT' }), 'utf8').toString('base64url');
const payload = Buffer.from(JSON.stringify({ fixture: true, value: 'observatorio-v33' }), 'utf8').toString('base64url');
const signingInput = Buffer.from(`${header}.${payload}`, 'ascii');
const signature = sign('sha256', signingInput, privateKey).toString('base64url');
const jws = `${header}.${payload}.${signature}`;

const proof = verifyCompactJws(jws, publicKey.export({ type: 'spki', format: 'pem' }).toString());
assert.equal(proof.valid, true);
assert.equal(proof.algorithm, 'RS256');
assert.match(proof.keyFingerprint, /^[a-f0-9]{64}$/);
assert.match(proof.proofSha256, /^[a-f0-9]{64}$/);

const tampered = `${header}.${Buffer.from(JSON.stringify({ fixture: true, value: 'tampered' }), 'utf8').toString('base64url')}.${signature}`;
assert.equal(verifyCompactJws(tampered, publicKey.export({ type: 'spki', format: 'pem' }).toString()).valid, false);

console.log('JWS verifier self-test: PASS');
