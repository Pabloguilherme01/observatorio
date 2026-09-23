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
    localConnection: 'Vereador em Águas Lindas de Goiás em 2024',
    localEvidenceUrl: 'https://www.tribunapr.com.br/eleicoes/2024/candidatos/go/aguas-lindas-de-goias/vereador/abadyas-damasceno-uniao-44123/',
    instagramUrl: 'https://www.instagram.com/abadyas_damasceno/',
    photoUrl: TSE_IMAGE('90002547004'),
    evidenceNote: 'Dados pessoais, patrimônio e rede social são declarações do registro eleitoral; o vínculo local é documentado por participação eleitoral no município.',
  },
  '90002549161': {
    fullName: 'Anderson Teodoro da Cunha Dourado',
    occupation: 'Vereador',
    education: 'Superior incompleto',
    declaredAssetsBrl: 990000,
    naturalidade: 'Goiânia/GO',
    localConnection: 'Base eleitoral declarada: Águas Lindas de Goiás',
    localEvidenceUrl: 'https://www.tribunapr.com.br/eleicoes/2026/candidatos/go/deputado-estadual/anderson-teodoro-prd-25789/',
    instagramUrl: null,
    photoUrl: TSE_IMAGE('90002549161'),
    evidenceNote: 'Não há Instagram cadastrado no TSE para este registro. O vínculo local usado pelo recorte é a base eleitoral declarada para Águas Lindas.',
  },
  '90002537423': {
    fullName: 'Sildiomar de Carvalho Ribeiro',
    occupation: 'Comerciante',
    education: 'Ensino médio completo',
    declaredAssetsBrl: 60000,
    naturalidade: 'Senhor do Bonfim/BA',
    localConnection: 'Vereador em Águas Lindas de Goiás em 2024',
    localEvidenceUrl: 'https://www.meuvoto.org.br/candidato/90002537423.html',
    instagramUrl: 'https://www.instagram.com/baianodoscocosoficial_/',
    photoUrl: TSE_IMAGE('90002537423'),
    evidenceNote: 'O Instagram exibido é o endereço declarado no registro de candidatura, não uma verificação independente de autenticidade ou atividade.',
  },
  '90002543768': {
    fullName: 'Felipe de Moura Galdino Fernandes',
    occupation: 'Empresário',
    education: 'Superior incompleto',
    declaredAssetsBrl: 29000,
    naturalidade: 'Brasília/DF',
    localConnection: 'Disputou vereador em Águas Lindas em 2020 e 2024',
    localEvidenceUrl: 'https://www.meuvoto.org.br/candidato/90002543768.html',
    instagramUrl: 'https://www.instagram.com/felipegaldinobr/',
    photoUrl: TSE_IMAGE('90002543768'),
    evidenceNote: 'O Instagram exibido é o endereço declarado no registro de candidatura.',
  },
  '90002543113': {
    fullName: 'Cleriston Rocha da Trindade',
    occupation: 'Vendedor pracista, representante, caixeiro-viajante e assemelhados',
    education: 'Superior completo',
    declaredAssetsBrl: 270700,
    naturalidade: 'Santana/BA',
    localConnection: 'Vereador em Águas Lindas de Goiás em 2024',
    localEvidenceUrl: 'https://www.tribunapr.com.br/eleicoes/2024/candidatos/go/aguas-lindas-de-goias/vereador/keke-da-vulkanic-mobiliza-33777/',
    instagramUrl: 'https://www.instagram.com/kekevulkanic/',
    photoUrl: TSE_IMAGE('90002543113'),
    evidenceNote: 'O Instagram exibido é o endereço declarado no registro de candidatura.',
  },
  '90002544890': {
    fullName: 'Francisco Jose Rodrigues Ribeiro',
    occupation: 'Policial Militar',
    education: 'Superior completo',
    declaredAssetsBrl: 2632041.93,
    naturalidade: 'Alto Paraíso de Goiás/GO',
    localConnection: 'Disputou a prefeitura de Águas Lindas em 2024',
    localEvidenceUrl: 'https://www.meuvoto.org.br/candidato/90002544890.html',
    instagramUrl: 'https://www.instagram.com/tullioaguaslindas/',
    photoUrl: TSE_IMAGE('90002544890'),
    evidenceNote: 'O Instagram exibido é o endereço declarado no registro de candidatura.',
  },
  '90002543127': {
    fullName: 'Jose Barbosa da Silva',
    occupation: 'Comerciante',
    education: 'Ensino médio completo',
    declaredAssetsBrl: 105000,
    naturalidade: 'Goianésia/GO',
    localConnection: 'Vereador em Águas Lindas de Goiás em 2016',
    localEvidenceUrl: 'https://www.meuvoto.org.br/candidato/90002543127.html',
    instagramUrl: 'https://www.instagram.com/zedaimperialoficial/',
    photoUrl: TSE_IMAGE('90002543127'),
    evidenceNote: 'O Instagram exibido é o endereço declarado no registro de candidatura.',
  },
};
