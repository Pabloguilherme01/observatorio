import { createHash, createPublicKey, verify as verifySignature } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const OFFICIAL_JWK = JSON.parse(readFileSync(resolve(fileURLToPath(new URL('.', import.meta.url)), 'tse-official-jwk.json'), 'utf8'));
const EXPECTED_ALG = 'EdDSA';
const EXPECTED_CURVE = 'Ed25519';

function decodeBase64Url(value) {
  return Buffer.from(value.replace(/-/g, '+').replace(/_/g, '/'), 'base64');
}

function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (!token.startsWith('--')) continue;
    args[token.slice(2)] = argv[i + 1];
    i += 1;
  }
  return args;
}

function keyFingerprint(publicKey) {
  return createHash('sha256').update(publicKey.export({ type: 'spki', format: 'der' })).digest('hex');
}

export function verifyCompactJws(jws, options = {}) {
  const parts = jws.trim().split('.');
  if (parts.length !== 3) throw new Error('JWS compacto inválido: esperado protected.payload.signature.');
  const [protectedPart, payloadPart, signaturePart] = parts;
  const header = JSON.parse(decodeBase64Url(protectedPart).toString('utf8'));

  if (header.alg !== EXPECTED_ALG) throw new Error(`Algoritmo JWS inesperado: ${String(header.alg)}. O TSE 2026 usa EdDSA/Ed25519.`);
  if (header.kid !== OFFICIAL_JWK.kid) throw new Error('kid do JWS não corresponde à chave oficial fixada do TSE.');
  if (OFFICIAL_JWK.alg !== EXPECTED_ALG || OFFICIAL_JWK.crv !== EXPECTED_CURVE) throw new Error('Configuração da chave oficial incompatível.');

  const publicKey = createPublicKey({ key: options.publicJwk ?? OFFICIAL_JWK, format: 'jwk' });
  const signingInput = Buffer.from(`${protectedPart}.${payloadPart}`, 'ascii');
  const signature = decodeBase64Url(signaturePart);
  const valid = verifySignature(null, signingInput, publicKey, signature);
  const decodedPayload = decodeBase64Url(payloadPart);
  const proofSha256 = createHash('sha256').update(Buffer.from(jws.trim(), 'utf8')).digest('hex');

  return {
    valid,
    algorithm: EXPECTED_ALG,
    curve: EXPECTED_CURVE,
    kid: header.kid,
    keyFingerprint: keyFingerprint(publicKey),
    proofSha256,
    payloadSha256: createHash('sha256').update(decodedPayload).digest('hex'),
    payload: JSON.parse(decodedPayload.toString('utf8')),
    verifiedAt: new Date().toISOString(),
    verificationMethod: 'tse-official-jwk-ed25519',
    trustScope: 'tse-official-jwk-kid-pinned',
  };
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const args = parseArgs(process.argv.slice(2));
  if (!args.jws) {
    console.error('Uso: node scripts/verify-jws.mjs --jws arquivo.jws [--output proof.json]');
    process.exit(2);
  }

  try {
    const proof = verifyCompactJws(readFileSync(args.jws, 'utf8'));
    const result = { valid: proof.valid, proof };
    if (args.output) writeFileSync(args.output, JSON.stringify(result, null, 2) + '\n', 'utf8');
    console.log(JSON.stringify(result, null, 2));
    process.exit(proof.valid ? 0 : 1);
  } catch (error) {
    console.error(JSON.stringify({ valid: false, error: String(error) }, null, 2));
    process.exit(1);
  }
}
