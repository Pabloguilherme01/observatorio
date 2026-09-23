export const navigation = [
  { id: 'dashboard', label: 'Dashboard', shortLabel: 'Dashboard', description: 'Visão geral', shortcut: 'G D' },
  { id: 'eleitorado', label: 'Eleitorado', shortLabel: 'Eleitorado', description: 'Perfil eleitoral', shortcut: 'G E' },
  { id: 'demografia', label: 'Demografia', shortLabel: 'Demografia', description: 'Séries populacionais', shortcut: 'G M' },
  { id: 'transporte', label: 'Transporte', shortLabel: 'Transporte', description: 'Mobilidade e tarifas', shortcut: 'G T' },
  { id: 'politica', label: 'Política', shortLabel: 'Política', description: 'Pesquisas documentais', shortcut: 'G P' },
  { id: 'eleitoral360', label: 'Eleitoral 360°', shortLabel: '360°', description: 'Snapshots e registros', shortcut: 'G X' },
  { id: 'linha-do-tempo', label: 'Linha do tempo', shortLabel: 'Timeline', description: 'Calendário eleitoral', shortcut: 'G L' },
  { id: 'orcamento', label: 'Orçamento', shortLabel: 'Orçamento', description: 'Receitas e despesas', shortcut: 'G O' },
  { id: 'orcamento-impacto', label: 'Impacto fiscal', shortLabel: 'Impacto', description: 'Orçamento por denominador', shortcut: 'G I' },
  { id: 'dados', label: 'Dados', shortLabel: 'Dados', description: 'Atualizações públicas', shortcut: 'G A' },
  { id: 'qualidade', label: 'Qualidade', shortLabel: 'Qualidade', description: 'Integridade e proveniência', shortcut: 'G Q' },
  { id: 'fontes', label: 'Fontes', shortLabel: 'Fontes', description: 'Mapa de evidências', shortcut: 'G F' },
] as const;

export type NavigationId = typeof navigation[number]['id'];

export const getNavigationTarget = (id: NavigationId) => document.getElementById(id);
