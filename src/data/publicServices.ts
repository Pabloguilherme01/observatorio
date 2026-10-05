import {
  BriefcaseBusiness,
  Building2,
  CheckCircle2,
  ClipboardCheck,
  Droplets,
  FileQuestion,
  GraduationCap,
  Landmark,
  MessageCircle,
  Pill,
  ReceiptText,
  Scale,
  SearchCheck,
  ShieldCheck,
  Smartphone,
  Stethoscope,
  WalletCards,
  type LucideIcon,
} from 'lucide-react';

export interface PublicServiceResource {
  readonly icon: LucideIcon;
  readonly title: string;
  readonly description: string;
  readonly href: string;
  readonly cta?: string;
}

export const priorityPublicServices = [
  { icon: Pill, title: 'Medicamentos SUS', description: 'Consulte a lista oficial de medicamentos do município.', href: 'https://acessoainformacao.aguaslindasdegoias.go.gov.br/cidadao/outras_informacoes/medicamentos_sus' },
  { icon: CheckCircle2, title: 'Estoque de medicamentos', description: 'Consulte os estoques informados pelas farmácias públicas.', href: 'https://acessoainformacao.aguaslindasdegoias.go.gov.br/cidadao/outras_informacoes/estoque_medicamentos_farmacias' },
  { icon: Stethoscope, title: 'Regulação municipal', description: 'Consulte a lista de espera da regulação municipal.', href: 'https://acessoainformacao.aguaslindasdegoias.go.gov.br/cidadao/outras_informacoes/lista_espera_regulacoes' },
  { icon: WalletCards, title: 'Despesas públicas', description: 'Consulte despesas e movimentações do Executivo municipal.', href: 'https://acessoainformacao.aguaslindasdegoias.go.gov.br/cidadao/transparencia/sgdespesas' },
  { icon: ReceiptText, title: 'Licitações', description: 'Consulte licitações, dispensas e processos de contratação.', href: 'https://acessoainformacao.aguaslindasdegoias.go.gov.br/cidadao/informacao/sglicitacoes' },
  { icon: BriefcaseBusiness, title: 'Contratos', description: 'Consulte contratos e fiscais de contratos do município.', href: 'https://acessoainformacao.aguaslindasdegoias.go.gov.br/cidadao/informacao/sgcontratos' },
  { icon: Building2, title: 'Acompanhamento de obras', description: 'Consulte obras e obras paralisadas no portal oficial.', href: 'https://acessoainformacao.aguaslindasdegoias.go.gov.br/cidadao/informacao/obras' },
  { icon: GraduationCap, title: 'Lista de espera em creches', description: 'Consulte a lista oficial publicada pela Prefeitura.', href: 'https://aguaslindasdegoias.go.gov.br/lista-de-espera-em-creches/' },
  { icon: ShieldCheck, title: 'CRAS e assistência social', description: 'Consulte unidades, contatos e horários da rede municipal de assistência social.', href: 'https://aguaslindasdegoias.go.gov.br/estrutura/secretaria-de-assistencia-social-cidadania-e-juventude/' },
  { icon: Scale, title: 'CREAS', description: 'Consulte o serviço especializado de assistência social, contatos e horário oficial.', href: 'https://aguaslindasdegoias.go.gov.br/estrutura/secretaria-de-assistencia-social-cidadania-e-juventude/centro-de-referencia-especializado-de-assistencia-social-creas/' },
  { icon: ShieldCheck, title: 'Defesa Civil', description: 'Acesse informações municipais de emergência e o contato oficial da Defesa Civil.', href: 'https://aguaslindasdegoias.go.gov.br/prefeitura-de-aguas-lindas-decreta-situacao-de-emergencia-apos-chuvas-intensas-e-inundacoes/' },
  { icon: Droplets, title: 'Água e esgoto — atendimento', description: 'Acesse os canais oficiais da Saneago para atendimento, ocorrências e serviços de abastecimento e esgotamento sanitário.', href: 'https://www.saneago.com.br/site/atendimentos/atendimento_telefone_estado_goias' },
  { icon: ShieldCheck, title: 'Conselho Tutelar', description: 'Consulte endereço, horário e contato oficial do Conselho Tutelar.', href: 'https://aguaslindasdegoias.go.gov.br/estrutura/secretaria-de-assistencia-social-cidadania-e-juventude/conselho-tutelar/' },
  { icon: Stethoscope, title: 'CAPS', description: 'Consulte endereço, horário e contato oficial do Centro de Atenção Psicossocial.', href: 'https://aguaslindasdegoias.go.gov.br/estrutura/secretaria-de-saude-2/caps-centro-de-atencao-psicossocial/' },
  { icon: Stethoscope, title: 'SAMU', description: 'Acesse o serviço oficial e o número de emergência 192.', href: 'https://aguaslindasdegoias.go.gov.br/estrutura/secretaria-de-saude-2/samu-servico-de-atendimento-movel-de-urgencia/' },
  { icon: Smartphone, title: 'Portal SEI · Pessoa com deficiência', description: 'Localize a unidade municipal responsável pelas políticas e atendimento à pessoa com deficiência.', href: 'https://portalsei.aguaslindasdegoias.go.gov.br/' },
  { icon: ShieldCheck, title: 'Portal SEI · Proteção e bem-estar animal', description: 'Localize o FUBEM e o Canil Municipal na estrutura oficial do município.', href: 'https://portalsei.aguaslindasdegoias.go.gov.br/' },
  { icon: Smartphone, title: 'Trânsito e mobilidade urbana', description: 'Consulte a Secretaria Municipal de Trânsito e Mobilidade Urbana, contatos e horários oficiais.', href: 'https://aguaslindasdegoias.go.gov.br/estrutura/secretaria-de-transito-e-mobilidade-urbana/' },
] as const;

export const additionalPublicServices = [
  { icon: WalletCards, title: 'Diárias e passagens', description: 'Consulte despesas de diárias e passagens publicadas pela Prefeitura.', href: 'https://acessoainformacao.aguaslindasdegoias.go.gov.br/cidadao/transparencia/sgdiarias', cta: 'Consultar diárias' },
  { icon: MessageCircle, title: 'Denúncias à Ouvidoria', description: 'Acesse o canal oficial para registrar denúncias administrativas.', href: 'https://acessoainformacao.aguaslindasdegoias.go.gov.br/cidadao/ouvidoria/denuncia', cta: 'Registrar denúncia' },
  { icon: Landmark, title: 'Emendas federais', description: 'Consulte emendas parlamentares federais vinculadas ao município.', href: 'https://acessoainformacao.aguaslindasdegoias.go.gov.br/cidadao/informacao/emendas_federais', cta: 'Consultar emendas' },
  { icon: Landmark, title: 'Emendas estaduais', description: 'Consulte emendas parlamentares estaduais vinculadas ao município.', href: 'https://acessoainformacao.aguaslindasdegoias.go.gov.br/cidadao/informacao/emendas_estaduais', cta: 'Consultar emendas' },
  { icon: Landmark, title: 'Emendas municipais', description: 'Consulte emendas parlamentares municipais publicadas.', href: 'https://acessoainformacao.aguaslindasdegoias.go.gov.br/cidadao/informacao/emendas_municipais', cta: 'Consultar emendas' },
  { icon: ClipboardCheck, title: 'Prestação de contas anual', description: 'Consulte o balanço anual e documentos de prestação de contas.', href: 'https://acessoainformacao.aguaslindasdegoias.go.gov.br/cidadao/atos_adm/mp/id%3D20', cta: 'Consultar contas' },
  { icon: ClipboardCheck, title: 'Pareceres do Tribunal de Contas', description: 'Consulte pareceres relacionados às contas municipais.', href: 'https://acessoainformacao.aguaslindasdegoias.go.gov.br/cidadao/resp_fiscal/tcpareceres', cta: 'Consultar pareceres' },
  { icon: ReceiptText, title: 'Relatório de Gestão Fiscal', description: 'Consulte os Relatórios de Gestão Fiscal do município.', href: 'https://acessoainformacao.aguaslindasdegoias.go.gov.br/cidadao/resp_fiscal/rgfs', cta: 'Consultar RGF' },
  { icon: ReceiptText, title: 'Relatório orçamentário', description: 'Consulte os Relatórios Resumidos de Execução Orçamentária.', href: 'https://acessoainformacao.aguaslindasdegoias.go.gov.br/cidadao/resp_fiscal/rreos', cta: 'Consultar RREO' },
  { icon: Landmark, title: 'Planejamento orçamentário', description: 'Consulte o planejamento orçamentário publicado pelo município.', href: 'https://acessoainformacao.aguaslindasdegoias.go.gov.br/cidadao/resp_fiscal/planejamento', cta: 'Consultar planejamento' },
  { icon: ShieldCheck, title: 'Encarregado LGPD', description: 'Consulte o canal oficial do município para proteção de dados pessoais.', href: 'https://acessoainformacao.aguaslindasdegoias.go.gov.br/cidadao/outras_informacoes/encarregado_lgpd', cta: 'Consultar LGPD' },
  { icon: SearchCheck, title: 'Pesquisas de satisfação', description: 'Consulte pesquisas de satisfação dos serviços municipais.', href: 'https://acessoainformacao.aguaslindasdegoias.go.gov.br/cidadao/outras_informacoes/pesquisas_satisfacao', cta: 'Consultar pesquisas' },
  { icon: Stethoscope, title: 'Plano Municipal de Saúde', description: 'Consulte o planejamento oficial da política municipal de saúde.', href: 'https://acessoainformacao.aguaslindasdegoias.go.gov.br/cidadao/outras_informacoes/plano_municipal_saude', cta: 'Consultar plano' },
  { icon: Stethoscope, title: 'Programação anual da Saúde', description: 'Consulte a programação anual publicada pela área de saúde.', href: 'https://acessoainformacao.aguaslindasdegoias.go.gov.br/cidadao/outras_informacoes/programacao_anual_saude', cta: 'Consultar programação' },
  { icon: Stethoscope, title: 'Relatório de Gestão da Saúde', description: 'Consulte os relatórios anuais de gestão da saúde municipal.', href: 'https://acessoainformacao.aguaslindasdegoias.go.gov.br/cidadao/outras_informacoes/relatoriosanualdegestao', cta: 'Consultar relatório' },
  { icon: Landmark, title: 'Conselho Municipal de Saúde', description: 'Consulte informações e documentos do Conselho de Saúde.', href: 'https://acessoainformacao.aguaslindasdegoias.go.gov.br/cidadao/outras_informacoes/conselho_saude', cta: 'Consultar conselho' },
  { icon: WalletCards, title: 'Dívida ativa', description: 'Consulte informações públicas sobre inscritos em dívida ativa.', href: 'https://acessoainformacao.aguaslindasdegoias.go.gov.br/cidadao/transparencia/divida_ativa_pdt', cta: 'Consultar dívida ativa' },
  { icon: BriefcaseBusiness, title: 'Terceirizados', description: 'Consulte a relação de trabalhadores terceirizados publicada.', href: 'https://acessoainformacao.aguaslindasdegoias.go.gov.br/cidadao/outras_informacoes/lista_terceirizados', cta: 'Consultar terceirizados' },
  { icon: BriefcaseBusiness, title: 'Processos seletivos', description: 'Consulte processos seletivos simplificados publicados pelo município.', href: 'https://acessoainformacao.aguaslindasdegoias.go.gov.br/cidadao/concursos_selecoes/selecoes', cta: 'Consultar seleções' },
  { icon: WalletCards, title: 'Padrão remuneratório', description: 'Consulte referências de remuneração e padrões publicados.', href: 'https://acessoainformacao.aguaslindasdegoias.go.gov.br/cidadao/transparencia/padraoremuneratorio', cta: 'Consultar remuneração' },
  { icon: BriefcaseBusiness, title: 'Lista de estagiários', description: 'Consulte a relação pública de estagiários.', href: 'https://acessoainformacao.aguaslindasdegoias.go.gov.br/cidadao/outras_informacoes/lista_estagiarios', cta: 'Consultar estagiários' },
  { icon: FileQuestion, title: 'SIC direto', description: 'Acesse diretamente o Serviço de Informação ao Cidadão.', href: 'https://acessoainformacao.aguaslindasdegoias.go.gov.br/cidadao/informacao/sic', cta: 'Abrir SIC' },
  { icon: ReceiptText, title: 'Licitações fracassadas e desertas', description: 'Consulte processos licitatórios sem vencedor ou que foram declarados desertos.', href: 'https://acessoainformacao.aguaslindasdegoias.go.gov.br/cidadao/informacao/sglicitacoes_fd', cta: 'Consultar licitações' },
  { icon: ShieldCheck, title: 'Sanções administrativas', description: 'Consulte sanções administrativas publicadas no portal oficial.', href: 'https://acessoainformacao.aguaslindasdegoias.go.gov.br/cidadao/informacao/sancoes_administrativas', cta: 'Consultar sanções' },
  { icon: ClipboardCheck, title: 'Balanço anual', description: 'Consulte a prestação de contas e o balanço anual publicados pelo município.', href: 'https://acessoainformacao.aguaslindasdegoias.go.gov.br/cidadao/resp_fiscal/balancos', cta: 'Consultar balanço' },
  { icon: Scale, title: 'Renúncias fiscais', description: 'Consulte renúncias de receita publicadas pelo município.', href: 'https://acessoainformacao.aguaslindasdegoias.go.gov.br/cidadao/resp_fiscal/renunciareceita', cta: 'Consultar renúncias' },
  { icon: GraduationCap, title: 'Plano Municipal de Educação', description: 'Consulte o relatório de resultados do planejamento educacional municipal.', href: 'https://acessoainformacao.aguaslindasdegoias.go.gov.br/cidadao/outras_informacoes/plano_municipal_educacao', cta: 'Consultar educação' },
  { icon: FileQuestion, title: 'Processos eletrônicos SEI', description: 'Consulte o portal oficial do SEI de Águas Lindas de Goiás.', href: 'https://portalsei.aguaslindasdegoias.go.gov.br/', cta: 'Abrir Portal SEI' },
] as const;


export const allMunicipalServices = [...priorityPublicServices, ...additionalPublicServices];

export const normalizePublicServiceQuery = (value: string) =>
  value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('pt-BR').trim();

export const publicServiceSearchAliases: Record<string, string> = {
  'Processos seletivos': 'emprego trabalho vaga vagas oportunidade oportunidades concurso concursos selecao qualificacao',
  'Lista de estagiários': 'emprego trabalho vaga vagas estagio estagios estudante',
  'Padrão remuneratório': 'salario salarios remuneracao servidor servidores',
  'SIC direto': 'documentos informacao pedido acesso protocolo',
  'Processos eletrônicos SEI': 'documentos processo processos protocolo requerimento',
  'Planejamento orçamentário': 'orcamento loa ppa ldo planejamento',
  'Despesas públicas': 'gastos gasto dinheiro despesas pagamentos',
  'Licitações': 'compras contratacao compras publicas edital editais',
  'Contratos': 'contratacao fornecedor fornecedores fiscal fiscais',
  'CRAS e assistência social': 'beneficio beneficios cadastro unico cadunico bolsa familia vulnerabilidade',
  'Trânsito e mobilidade urbana': 'transito transporte mobilidade rua sinalizacao',
};
