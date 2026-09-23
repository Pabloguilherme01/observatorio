export interface CandidateProfile {
  readonly fullName: string;
  readonly occupation: string;
  readonly education: string;
  readonly declaredAssetsBrl: number | null;
  readonly naturalidade: string;
  readonly localConnection: string;
  readonly localEvidenceUrl: string;
  readonly instagramUrl: string | null;
  readonly photoUrl: string;
  readonly evidenceNote: string;
}

export const LOCAL_CANDIDATE_IDS = [
  '90002547004',
  '90002549161',
  '90002537423',
  '90002543768',
  '90002543113',
  '90002544890',
  '90002543127',
] as const;

export const EXCLUDED_FROM_LOCAL_RECORTE_IDS = [
  '90002547039',
  '90002546223',
  '90002547032',
] as const;

const TSE_IMAGE = (sqCandidate: string) =>
  'https://divulgacandcontas.tse.jus.br/divulga/rest/arquivo/img/20322002026/' + sqCandidate + '/GO';

export const CANDIDATE_PROFILES: Readonly<Record<string, CandidateProfile>> = {
  '90002547004': {
    fullName: 'Abadias Souza do Nascimento Damasceno',
    occupation: 'Eletricista e assemelhados',
    education: 'Ensino médio incompleto',
    declaredAssetsBrl: 57531,
    naturalidade: 'Brasília/DF',
    localConnection: 'Município do registro: Águas Lindas de Goiás',
    localEvidenceUrl: 'https://dadosabertos.tse.jus.br/dataset/candidatos-2026',
    instagramUrl: null,
    photoUrl: TSE_IMAGE('90002547004'),
    evidenceNote: 'Inclusão baseada no filtro municipal do conjunto oficial de candidatos do TSE. O Instagram só aparece quando declarado no conjunto oficial de redes sociais.',
  },
  '90002549161': {
    fullName: 'Anderson Teodoro da Cunha Dourado',
    occupation: 'Vereador',
    education: 'Superior incompleto',
    declaredAssetsBrl: 990000,
    naturalidade: 'Goiânia/GO',
    localConnection: 'Município do registro: Águas Lindas de Goiás',
    localEvidenceUrl: 'https://dadosabertos.tse.jus.br/dataset/candidatos-2026',
    instagramUrl: null,
    photoUrl: TSE_IMAGE('90002549161'),
    evidenceNote: 'Inclusão baseada no filtro municipal do conjunto oficial de candidatos do TSE. O Instagram só aparece quando declarado no conjunto oficial de redes sociais.',
  },
  '90002537423': {
    fullName: 'Sildiomar de Carvalho Ribeiro',
    occupation: 'Comerciante',
    education: 'Ensino médio completo',
    declaredAssetsBrl: 60000,
    naturalidade: 'Senhor do Bonfim/BA',
    localConnection: 'Município do registro: Águas Lindas de Goiás',
    localEvidenceUrl: 'https://dadosabertos.tse.jus.br/dataset/candidatos-2026',
    instagramUrl: null,
    photoUrl: TSE_IMAGE('90002537423'),
    evidenceNote: 'Inclusão baseada no filtro municipal do conjunto oficial de candidatos do TSE. O Instagram só aparece quando declarado no conjunto oficial de redes sociais.',
  },
  '90002543768': {
    fullName: 'Felipe de Moura Galdino Fernandes',
    occupation: 'Empresário',
    education: 'Superior incompleto',
    declaredAssetsBrl: 29000,
    naturalidade: 'Brasília/DF',
    localConnection: 'Município do registro: Águas Lindas de Goiás',
    localEvidenceUrl: 'https://dadosabertos.tse.jus.br/dataset/candidatos-2026',
    instagramUrl: null,
    photoUrl: TSE_IMAGE('90002543768'),
    evidenceNote: 'Inclusão baseada no filtro municipal do conjunto oficial de candidatos do TSE. O Instagram só aparece quando declarado no conjunto oficial de redes sociais.',
  },
  '90002543113': {
    fullName: 'Cleriston Rocha da Trindade',
    occupation: 'Vendedor pracista, representante, caixeiro-viajante e assemelhados',
    education: 'Superior completo',
    declaredAssetsBrl: 270700,
    naturalidade: 'Santana/BA',
    localConnection: 'Município do registro: Águas Lindas de Goiás',
    localEvidenceUrl: 'https://dadosabertos.tse.jus.br/dataset/candidatos-2026',
    instagramUrl: null,
    photoUrl: TSE_IMAGE('90002543113'),
    evidenceNote: 'Inclusão baseada no filtro municipal do conjunto oficial de candidatos do TSE. O Instagram só aparece quando declarado no conjunto oficial de redes sociais.',
  },
  '90002544890': {
    fullName: 'Francisco Jose Rodrigues Ribeiro',
    occupation: 'Policial Militar',
    education: 'Superior completo',
    declaredAssetsBrl: 2632041.93,
    naturalidade: 'Alto Paraíso de Goiás/GO',
    localConnection: 'Município do registro: Águas Lindas de Goiás',
    localEvidenceUrl: 'https://dadosabertos.tse.jus.br/dataset/candidatos-2026',
    instagramUrl: null,
    photoUrl: TSE_IMAGE('90002544890'),
    evidenceNote: 'Inclusão baseada no filtro municipal do conjunto oficial de candidatos do TSE. O Instagram só aparece quando declarado no conjunto oficial de redes sociais.',
  },
  '90002543127': {
    fullName: 'Jose Barbosa da Silva',
    occupation: 'Comerciante',
    education: 'Ensino médio completo',
    declaredAssetsBrl: 105000,
    naturalidade: 'Goianésia/GO',
    localConnection: 'Município do registro: Águas Lindas de Goiás',
    localEvidenceUrl: 'https://dadosabertos.tse.jus.br/dataset/candidatos-2026',
    instagramUrl: null,
    photoUrl: TSE_IMAGE('90002543127'),
    evidenceNote: 'Inclusão baseada no filtro municipal do conjunto oficial de candidatos do TSE. O Instagram só aparece quando declarado no conjunto oficial de redes sociais.',
  },
};
