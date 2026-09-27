export const navigation = [
  { id: 'descubra', label: 'Começar', shortLabel: 'Começar', description: 'Escolha o que você quer consultar', shortcut: 'G R', group: 'primary' },
  { id: 'dashboard', label: 'Indicadores', shortLabel: 'Indicadores', description: 'Visão geral dos dados da cidade', shortcut: 'G D', group: 'primary' },
  { id: 'eleitorado', label: 'Eleitorado', shortLabel: 'Eleitorado', description: 'Perfil eleitoral', shortcut: 'G E', group: 'more' },
  { id: 'transporte', label: 'Transporte', shortLabel: 'Transporte', description: 'Mobilidade e tarifas', shortcut: 'G T', group: 'more' },
  { id: 'saude', label: 'Saúde e saneamento', shortLabel: 'Saúde', description: 'Cobertura, saneamento e capacidade', shortcut: 'G S', group: 'more' },
  { id: 'eleitoral360', label: 'Eleições 2026', shortLabel: 'Eleições', description: 'Snapshots, candidaturas e registros', shortcut: 'G X', group: 'primary' },
  { id: 'quiz', label: 'Teste seus conhecimentos', shortLabel: 'Quiz', description: 'Perguntas de educação cívica', shortcut: 'G QZ', group: 'more' },
  { id: 'orcamento', label: 'Orçamento', shortLabel: 'Orçamento', description: 'Receitas e despesas', shortcut: 'G O', group: 'more' },
  { id: 'acao', label: 'Serviços públicos', shortLabel: 'Serviços', description: 'Encontre canais e serviços oficiais', shortcut: 'G U', group: 'more' },
  { id: 'fontes', label: 'Como sabemos', shortLabel: 'Fontes', description: 'Confira fonte, data, método e limitações', shortcut: 'G F', group: 'more' },
  { id: 'exportacao', label: 'Baixar dados', shortLabel: 'Baixar', description: 'Exporte dados e metadados', shortcut: 'G B', group: 'more' },
] as const;

export type NavigationId = typeof navigation[number]['id'];

export const getNavigationTarget = (id: NavigationId) => document.getElementById(id);
