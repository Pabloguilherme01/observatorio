import assert from 'node:assert/strict';
import { generateKeyPairSync, sign } from 'node:crypto';
import { verifyCompactJws } from './verify-jws.mjs';

const { privateKey, publicKey } = generateKeyPairSync('ed25519');
const customJwk = publicKey.export({ format: 'jwk' });
customJwk.alg = 'EdDSA';
customJwk.kid = 'sNbt9Q_fLS65zE1_ZLNV-XRRwPY';
customJwk.use = 'sig';
customJwk.key_ops = ['verify'];

const header = Buffer.from(JSON.stringify({ alg: 'EdDSA', kid: customJwk.kid, typ: 'JWS' }), 'utf8').toString('base64url');
const payload = Buffer.from(JSON.stringify({ fixture: true, value: 'observatorio-v34' }), 'utf8').toString('base64url');
const signingInput = Buffer.from(`${header}.${payload}`, 'ascii');
const signature = sign(null, signingInput, privateKey).toString('base64url');
const jws = `${header}.${payload}.${signature}`;

const proof = verifyCompactJws(jws, { publicJwk: customJwk });
assert.equal(proof.valid, true);
assert.equal(proof.algorithm, 'EdDSA');
assert.equal(proof.curve, 'Ed25519');
assert.equal(proof.verifiedAt.length > 0, true);
assert.match(proof.proofSha256, /^[a-f0-9]{64}$/);
assert.equal(proof.payload.value, 'observatorio-v34');
assert.equal(verifyCompactJws(jws).valid, false);

const tamperedPayload = Buffer.from(JSON.stringify({ fixture: true, value: 'tampered' }), 'utf8').toString('base64url');
const tampered = `${header}.${tamperedPayload}.${signature}`;
assert.equal(verifyCompactJws(tampered, { publicJwk: customJwk }).valid, false);

console.log('JWS Ed25519 verifier self-test: PASS');
