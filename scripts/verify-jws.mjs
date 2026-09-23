import { constants, createHash, createPublicKey, verify as verifySignature } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';

export const ALGORITHMS = {
  RS256: { hash: 'sha256' },
  RS384: { hash: 'sha384' },
  RS512: { hash: 'sha512' },
  PS256: { hash: 'sha256', padding: constants.RSA_PKCS1_PSS_PADDING, saltLength: constants.RSA_PSS_SALTLEN_DIGEST },
  PS384: { hash: 'sha384', padding: constants.RSA_PKCS1_PSS_PADDING, saltLength: constants.RSA_PSS_SALTLEN_DIGEST },
  PS512: { hash: 'sha512', padding: constants.RSA_PKCS1_PSS_PADDING, saltLength: constants.RSA_PSS_SALTLEN_DIGEST },
} as const;

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

export function verifyCompactJws(jws, publicKeyPem) {
  const parts = jws.trim().split('.');
  if (parts.length !== 3) throw new Error('JWS compacto inválido: esperado protected.payload.signature.');
  const [protectedPart, payloadPart, signaturePart] = parts;
  const header = JSON.parse(decodeBase64Url(protectedPart).toString('utf8'));
  const algorithm = header.alg;
  const config = ALGORITHMS[algorithm];
  if (!config) throw new Error(`Algoritmo JWS não suportado pelo verificador: ${algorithm}`);

  const publicKey = createPublicKey(publicKeyPem);
  const signingInput = Buffer.from(`${protectedPart}.${payloadPart}`, 'ascii');
  const signature = decodeBase64Url(signaturePart);
  const verifyKey = config.padding
    ? { key: publicKey, padding: config.padding, saltLength: config.saltLength }
    : publicKey;

  const valid = verifySignature(config.hash, signingInput, verifyKey, signature);
  const spkiDer = publicKey.export({ type: 'spki', format: 'der' });
  const proofSha256 = createHash('sha256').update(Buffer.from(jws.trim(), 'utf8')).digest('hex');
  const keyFingerprint = createHash('sha256').update(spkiDer).digest('hex');

  return {
    valid,
    algorithm,
    keyFingerprint,
    proofSha256,
    payloadSha256: createHash('sha256').update(decodeBase64Url(payloadPart)).digest('hex'),
    verifiedAt: new Date().toISOString(),
    verificationMethod: 'jws-node-crypto',
    trustScope: 'signature-only-with-supplied-public-key',
  };
}

if (process.argv[1]?.endsWith('verify-jws.mjs')) {
  const args = parseArgs(process.argv.slice(2));
  if (!args.jws || !args['public-key']) {
    console.error('Uso: node scripts/verify-jws.mjs --jws arquivo.jws --public-key chave.pem [--output proof.json]');
    process.exit(2);
  }

  try {
    const proof = verifyCompactJws(readFileSync(args.jws, 'utf8'), readFileSync(args['public-key'], 'utf8'));
    const result = { valid: proof.valid, proof };
    if (args.output) writeFileSync(args.output, JSON.stringify(result, null, 2) + '\n', 'utf8');
    console.log(JSON.stringify(result, null, 2));
    process.exit(proof.valid ? 0 : 1);
  } catch (error) {
    console.error(JSON.stringify({ valid: false, error: String(error) }, null, 2));
    process.exit(1);
  }
}
