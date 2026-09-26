export const navigation = [
  { id: 'descubra', label: 'Descobrir', shortLabel: 'Descobrir', description: 'Escolha por onde começar', shortcut: 'G R', group: 'primary' },
  { id: 'principios', label: 'Princípios', shortLabel: 'Princípios', description: 'Método e correções', shortcut: 'G N', group: 'more' },
  { id: 'dashboard', label: 'Dashboard', shortLabel: 'Dashboard', description: 'Visão geral', shortcut: 'G D', group: 'primary' },
  { id: 'contexto', label: 'Contexto', shortLabel: 'Contexto', description: 'Comparações descritivas', shortcut: 'G C', group: 'more' },
  { id: 'eleitorado', label: 'Eleitorado', shortLabel: 'Eleitorado', description: 'Perfil eleitoral', shortcut: 'G E', group: 'more' },
  { id: 'demografia', label: 'Demografia', shortLabel: 'Demografia', description: 'Séries populacionais', shortcut: 'G M', group: 'more' },
  { id: 'transporte', label: 'Transporte', shortLabel: 'Transporte', description: 'Mobilidade e tarifas', shortcut: 'G T', group: 'more' },
  { id: 'saude', label: 'Saúde e saneamento', shortLabel: 'Saúde', description: 'Cobertura, saneamento e capacidade', shortcut: 'G S', group: 'more' },
  { id: 'politica', label: 'Política', shortLabel: 'Política', description: 'Pesquisas documentais', shortcut: 'G P', group: 'more' },
  { id: 'eleitoral360', label: 'Eleições 2026', shortLabel: 'Eleições', description: 'Snapshots, candidaturas e registros', shortcut: 'G X', group: 'primary' },
  { id: 'linha-do-tempo', label: 'Linha do tempo', shortLabel: 'Timeline', description: 'Calendário eleitoral', shortcut: 'G L', group: 'more' },
  { id: 'quiz', label: 'Quiz', shortLabel: 'Quiz', description: 'Quiz de educação cívica', shortcut: 'G QZ', group: 'more' },
  { id: 'orcamento', label: 'Orçamento', shortLabel: 'Orçamento', description: 'Receitas e despesas', shortcut: 'G O', group: 'more' },
  { id: 'orcamento-impacto', label: 'Impacto fiscal', shortLabel: 'Impacto', description: 'Orçamento por denominador', shortcut: 'G I', group: 'more' },
  { id: 'dados', label: 'Dados', shortLabel: 'Dados', description: 'Atualizações públicas', shortcut: 'G A', group: 'more' },
  { id: 'qualidade', label: 'Qualidade', shortLabel: 'Qualidade', description: 'Integridade e proveniência', shortcut: 'G Q', group: 'more' },
  { id: 'evidencias', label: 'Evidências', shortLabel: 'Evidências', description: 'Cadeia de proveniência', shortcut: 'G V', group: 'more' },
  { id: 'acao', label: 'Como usar', shortLabel: 'Ação', description: 'Canais oficiais de participação', shortcut: 'G U', group: 'more' },
  { id: 'fontes', label: 'Fontes', shortLabel: 'Fontes', description: 'Mapa de evidências', shortcut: 'G F', group: 'more' },
  { id: 'exportacao', label: 'Exportação', shortLabel: 'Exportar', description: 'Baixar dados e metadados', shortcut: 'G B', group: 'more' },
] as const;

export type NavigationId = typeof navigation[number]['id'];

export const getNavigationTarget = (id: NavigationId) => document.getElementById(id);
