export const navigation = [
  { id: 'descubra', label: 'Descobrir', shortLabel: 'Descobrir', description: 'Escolha por onde começar', shortcut: 'G R', group: 'primary' },
  { id: 'dashboard', label: 'Dashboard', shortLabel: 'Dashboard', description: 'Visão geral', shortcut: 'G D', group: 'primary' },  { id: 'eleitorado', label: 'Eleitorado', shortLabel: 'Eleitorado', description: 'Perfil eleitoral', shortcut: 'G E', group: 'more' },
  { id: 'transporte', label: 'Transporte', shortLabel: 'Transporte', description: 'Mobilidade e tarifas', shortcut: 'G T', group: 'more' },
  { id: 'saude', label: 'Saúde e saneamento', shortLabel: 'Saúde', description: 'Cobertura, saneamento e capacidade', shortcut: 'G S', group: 'more' },
  { id: 'eleitoral360', label: 'Eleições 2026', shortLabel: 'Eleições', description: 'Snapshots, candidaturas e registros', shortcut: 'G X', group: 'primary' },
  { id: 'quiz', label: 'Quiz', shortLabel: 'Quiz', description: 'Quiz de educação cívica', shortcut: 'G QZ', group: 'more' },
  { id: 'orcamento', label: 'Orçamento', shortLabel: 'Orçamento', description: 'Receitas e despesas', shortcut: 'G O', group: 'more' },
  { id: 'acao', label: 'Serviços públicos', shortLabel: 'Serviços', description: 'Canais oficiais e participação', shortcut: 'G U', group: 'more' },
  { id: 'fontes', label: 'Fontes e método', shortLabel: 'Fontes', description: 'Origem, método e evidências', shortcut: 'G F', group: 'more' },
  { id: 'exportacao', label: 'Exportação', shortLabel: 'Exportar', description: 'Baixar dados e metadados', shortcut: 'G B', group: 'more' },
] as const;

export type NavigationId = typeof navigation[number]['id'];

export const getNavigationTarget = (id: NavigationId) => document.getElementById(id);
