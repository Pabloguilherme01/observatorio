import { BriefcaseBusiness, Building2, CheckCircle2, ClipboardCheck, Droplets, ExternalLink, FileQuestion, GraduationCap, Landmark, MessageCircle, Pill, ReceiptText, Scale, SearchCheck, ShieldCheck, Smartphone, Stethoscope, WalletCards } from 'lucide-react';
import { Card } from '../ui/Card';
import { SectionHeader } from '../ui/SectionHeader';
import { immediatePublicContacts } from '../../data/publicContacts';

const priorityPublicServices = [
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
  { icon: Droplets, title: 'Água e esgoto — atendimento', description: 'Acesse os canais oficiais da Saneago para atendimento, ocorrências e serviços de abastecimento e esgotamento sanitário.', href: 'https://www.saneago.com.br/site' },
  { icon: ShieldCheck, title: 'Conselho Tutelar', description: 'Consulte endereço, horário e contato oficial do Conselho Tutelar.', href: 'https://aguaslindasdegoias.go.gov.br/estrutura/secretaria-de-assistencia-social-cidadania-e-juventude/conselho-tutelar/' },
  { icon: Stethoscope, title: 'CAPS', description: 'Consulte endereço, horário e contato oficial do Centro de Atenção Psicossocial.', href: 'https://aguaslindasdegoias.go.gov.br/estrutura/secretaria-de-saude-2/caps-centro-de-atencao-psicossocial/' },
  { icon: Stethoscope, title: 'SAMU', description: 'Acesse o serviço oficial e o número de emergência 192.', href: 'https://aguaslindasdegoias.go.gov.br/estrutura/secretaria-de-saude-2/samu-servico-de-atendimento-movel-de-urgencia/' },
  { icon: Smartphone, title: 'Portal SEI · Pessoa com deficiência', description: 'Localize a unidade municipal responsável pelas políticas e atendimento à pessoa com deficiência.', href: 'https://portalsei.aguaslindasdegoias.go.gov.br/' },
  { icon: ShieldCheck, title: 'Portal SEI · Proteção e bem-estar animal', description: 'Localize o FUBEM e o Canil Municipal na estrutura oficial do município.', href: 'https://portalsei.aguaslindasdegoias.go.gov.br/' },
  { icon: Smartphone, title: 'Trânsito e mobilidade urbana', description: 'Consulte a Secretaria Municipal de Trânsito e Mobilidade Urbana, contatos e horários oficiais.', href: 'https://aguaslindasdegoias.go.gov.br/estrutura/secretaria-de-transito-e-mobilidade-urbana/' },
] as const;

const actions = [
  {
    category: 'Prefeitura',
    icon: Smartphone,
    title: 'Encontrar um serviço municipal',
    description: 'Consulte o catálogo oficial da Prefeitura, com busca e filtros por perfil e categoria, incluindo serviços ao cidadão.',
    href: 'https://aguaslindasdegoias.go.gov.br/servicos/',
    cta: 'Abrir Serviços da Prefeitura',
  },
  {
    category: 'Prefeitura',
    icon: Smartphone,
    title: 'Consultar unidades e serviços de saúde',
    description: 'Veja a estrutura oficial da Secretaria Municipal de Saúde e as unidades de atendimento listadas pela Prefeitura.',
    href: 'https://aguaslindasdegoias.go.gov.br/estrutura/secretaria-de-saude-2/',
    cta: 'Abrir Saúde Municipal',
  },
  {
    category: 'Prefeitura',
    icon: FileQuestion,
    title: 'Consultar legislação municipal',
    description: 'Pesquise leis e normas no portal oficial de legislação do município.',
    href: 'https://legislacao.aguaslindasdegoias.go.gov.br/leis',
    cta: 'Abrir Legislação',
  },
  {
    category: 'Prefeitura',
    icon: FileQuestion,
    title: 'Pedir informação',
    description: 'Use o SIC da Prefeitura para solicitar documentos, contratos, despesas ou esclarecimentos sobre dados públicos.',
    href: 'https://aguaslindasdegoias.go.gov.br/servico-de-informacao-ao-cidadao/',
    cta: 'Acessar SIC da Prefeitura',
  },
  {
    category: 'Participação e controle',
    icon: Landmark,
    title: 'Acompanhar o Legislativo',
    description: 'Consulte sessões, pautas, atas, leis e o portal de transparência da Câmara Municipal.',
    href: 'https://camaradeaguaslindas.go.gov.br/',
    cta: 'Acessar Câmara Municipal',
  },
  {
    category: 'Participação e controle',
    icon: Scale,
    title: 'Enviar manifestação',
    description: 'O TCMGO mantém Ouvidoria e SIC para solicitações, reclamações e comunicações relacionadas ao controle municipal.',
    href: 'https://www.tcmgo.tc.br/site/ouvidoria/',
    cta: 'Acessar Ouvidoria TCMGO',
  },
  {
    category: 'Saúde',
    icon: Stethoscope,
    title: 'Serviços de saúde (escalas)',
    description: 'Consulte as escalas de serviços de saúde publicadas pela Prefeitura.',
    href: 'https://acessoainformacao.aguaslindasdegoias.go.gov.br/cidadao/outras_informacoes/escalasmedicas',
    cta: 'Consultar escalas',
  },
  {
    category: 'Saúde',
    icon: Pill,
    title: 'Medicamentos de alto custo',
    description: 'Consulte as informações oficiais sobre medicamentos de alto custo.',
    href: 'https://acessoainformacao.aguaslindasdegoias.go.gov.br/cidadao/outras_informacoes/medicamentos_altocusto',
    cta: 'Consultar medicamentos',
  },
  {
    category: 'Transparência e controle',
    icon: Building2,
    title: 'Obras paralisadas',
    description: 'Consulte a relação oficial de obras paralisadas.',
    href: 'https://acessoainformacao.aguaslindasdegoias.go.gov.br/cidadao/informacao/obras_paralisadas',
    cta: 'Consultar obras',
  },
  {
    category: 'Transparência e controle',
    icon: ReceiptText,
    title: 'Dispensas e inexigibilidades',
    description: 'Consulte contratações diretas publicadas no portal oficial.',
    href: 'https://acessoainformacao.aguaslindasdegoias.go.gov.br/cidadao/informacao/sgdispensas',
    cta: 'Consultar dispensas',
  },
  {
    category: 'Transparência e controle',
    icon: ReceiptText,
    title: 'Plano de Contratações Anual',
    description: 'Consulte o planejamento anual das contratações municipais.',
    href: 'https://acessoainformacao.aguaslindasdegoias.go.gov.br/cidadao/informacao/plano_anual_contratacoes',
    cta: 'Consultar PCA',
  },
  {
    category: 'Transparência e controle',
    icon: WalletCards,
    title: 'Receitas municipais',
    description: 'Consulte as receitas públicas registradas no portal oficial.',
    href: 'https://acessoainformacao.aguaslindasdegoias.go.gov.br/cidadao/transparencia/sgreceitas',
    cta: 'Consultar receitas',
  },
  {
    category: 'Transparência e controle',
    icon: WalletCards,
    title: 'Folha de pagamento',
    description: 'Consulte a folha de pagamento e informações remuneratórias.',
    href: 'https://acessoainformacao.aguaslindasdegoias.go.gov.br/cidadao/transparencia/sgservidores',
    cta: 'Consultar folha',
  },
  {
    category: 'Transparência e controle',
    icon: BriefcaseBusiness,
    title: 'Concursos públicos',
    description: 'Consulte concursos públicos publicados pelo município.',
    href: 'https://acessoainformacao.aguaslindasdegoias.go.gov.br/cidadao/concursos_selecoes/concursos',
    cta: 'Consultar concursos',
  },
  {
    category: 'Transparência e controle',
    icon: BriefcaseBusiness,
    title: 'Fiscais de contratos',
    description: 'Consulte os fiscais designados para os contratos municipais.',
    href: 'https://acessoainformacao.aguaslindasdegoias.go.gov.br/cidadao/informacao/fiscais_contratos_sg',
    cta: 'Consultar fiscais',
  },
  {
    category: 'Transparência e controle',
    icon: ReceiptText,
    title: 'Ordem cronológica de pagamentos',
    description: 'Consulte a ordem cronológica de pagamentos do município.',
    href: 'https://acessoainformacao.aguaslindasdegoias.go.gov.br/cidadao/informacao/ordem_cronologica_pagamentos_pdt',
    cta: 'Consultar pagamentos',
  },
  {
    category: 'Transparência e controle',
    icon: SearchCheck,
    title: 'Dados abertos e API',
    description: 'Acesse os dados públicos automatizados disponibilizados pela Prefeitura.',
    href: 'https://acessoainformacao.aguaslindasdegoias.go.gov.br/cidadao/outras_informacoes/acesso_automatizado',
    cta: 'Abrir dados abertos',
  },
  {
    category: 'Participação e controle',
    icon: MessageCircle,
    title: 'Registrar reclamação',
    description: 'Registre reclamações diretamente no canal oficial de Ouvidoria.',
    href: 'https://acessoainformacao.aguaslindasdegoias.go.gov.br/cidadao/ouvidoria/reclamacao',
    cta: 'Registrar reclamação',
  },
  {
    icon: Smartphone,
    category: 'Eleições 2026',
    title: 'Usar o e-Título',
    description: 'Aplicativo oficial da Justiça Eleitoral para serviços como título digital, local de votação, justificativa e certidões.',
    href: 'https://www.tse.jus.br/servicos-eleitorais/servicos/aplicativo-e-titulo',
    cta: 'Abrir e-Título',
  },
  {
    icon: SearchCheck,
    category: 'Eleições 2026',
    title: 'Consultar candidaturas e contas',
    description: 'O TSE disponibiliza o DivulgaCandContas para consultar candidaturas, situação de registro e informações de contas eleitorais.',
    href: 'https://divulgacandcontas.tse.jus.br/divulga/#/',
    cta: 'Abrir DivulgaCandContas',
  },
  {
    icon: SearchCheck,
    category: 'Eleições 2026',
    title: 'Consultar local de votação',
    description: 'O TSE disponibiliza a consulta ao local de votação pelo e-Título e pelos canais oficiais da Justiça Eleitoral.',
    href: 'https://www.tse.jus.br/servicos-eleitorais/autoatendimento-eleitoral',
    cta: 'Consultar no TSE',
  },
  {
    icon: SearchCheck,
    category: 'Eleições 2026',
    title: 'Consultar situação eleitoral',
    description: 'Confira no Autoatendimento Eleitoral o número, a situação do título, débitos e onde votar. Em 2026, alistamento, transferência e revisão ficam suspensos de 7 de maio a 2 de novembro; outros serviços continuam disponíveis.',
    href: 'https://www.tse.jus.br/servicos-eleitorais/autoatendimento-eleitoral/',
    cta: 'Consultar no TSE',
  },
  {
    icon: FileQuestion,
    category: 'Eleições 2026',
    title: 'Justificar ausência',
    description: 'Consulte no TSE como justificar a ausência às urnas pelo e-Título, Autoatendimento ou atendimento eleitoral.',
    href: 'https://www.tse.jus.br/servicos-eleitorais/justificativa-eleitoral',
    cta: 'Ver como justificar',
  },
  {
    icon: ClipboardCheck,
    category: 'Eleições 2026',
    title: 'Emitir certidões eleitorais',
    description: 'Acesse a emissão e validação de certidões de quitação, crimes eleitorais e outros documentos oficiais.',
    href: 'https://www.tse.jus.br/servicos-eleitorais/certidoes',
    cta: 'Emitir certidão',
  },
  {
    icon: Scale,
    category: 'Eleições 2026',
    title: 'Quitar débitos eleitorais',
    description: 'Consulte e quite multas eleitorais pelos canais oficiais do TSE e confira as orientações de pagamento.',
    href: 'https://www.tse.jus.br/servicos-eleitorais/titulo-eleitoral/quitacao-de-multas',
    cta: 'Consultar débitos',
  },
  {
    icon: Landmark,
    category: 'Eleições 2026',
    title: 'Conferir calendário e regras',
    description: 'Consulte diretamente no TSE as datas, regras e orientações oficiais das Eleições 2026.',
    href: 'https://www.tse.jus.br/eleicoes/eleicoes-2026',
    cta: 'Abrir Eleições 2026',
  },
  {
    icon: Smartphone,
    category: 'Eleições 2026',
    title: 'Consultar o Pardal',
    description: 'Ferramenta oficial do TSE para encaminhar e acompanhar denúncias de propaganda eleitoral irregular.',
    href: 'https://pardal-web.tse.jus.br/',
    cta: 'Ver instruções do TSE',
  },
  {
    category: 'Participação e controle',
    icon: MessageCircle,
    title: 'Procurar o MPGO',
    description: 'O Ministério Público de Goiás recebe manifestações e orienta sobre canais para fatos que possam demandar atuação institucional.',
    href: 'https://www.mpgo.mp.br/portal/pagina/ouvidoria',
    cta: 'Acessar Ouvidoria MPGO',
  },
];


const additionalPublicServices = [
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


const MUNICIPAL_TRANSPARENCY_BASE = 'https://acessoainformacao.aguaslindasdegoias.go.gov.br/';

function PublicServiceLink({ href, label }: { readonly href: string; readonly label: string }) {
  const isMunicipalTransparency = String(href).startsWith(MUNICIPAL_TRANSPARENCY_BASE) && String(href) !== MUNICIPAL_TRANSPARENCY_BASE;
  return (
    <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1.5">
      <a href={href} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-10 items-center gap-1.5 text-[11px] font-bold text-sky-300 hover:text-sky-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300">
        {label} <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
      </a>
      {isMunicipalTransparency && (
        <a href={MUNICIPAL_TRANSPARENCY_BASE} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-10 items-center text-[10px] font-semibold text-slate-500 hover:text-slate-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300">
          Abrir portal-base
        </a>
      )}
    </div>
  );
}

function shareWhatsApp() {
  const url = window.location.href;
  const text = `Observatório Eleitoral — Águas Lindas de Goiás 2026. Dados públicos com fontes e limitações visíveis. ${url}`;
  window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank', 'noopener,noreferrer');
}

export function CivicActionHub() {
  return (
    <section id="acao" className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16" aria-labelledby="action-title">
      <SectionHeader
        titleId="action-title"
        eyebrow="Fontes e serviços oficiais"
        title="Atalhos oficiais sem complicação"
        description="Links diretos para consultar informações e serviços. O órgão responsável continua sendo a fonte oficial."
      />

      <div className="official-hub">
        <div className="official-hub-head">
          <div>
            <span className="official-hub-kicker">Justiça Eleitoral · TSE</span>
            <h3 className="official-hub-title">Recursos oficiais</h3>
            <p className="official-hub-subtitle">Comece por uma das ferramentas mais usadas nas Eleições 2026.</p>
          </div>
          <a className="official-hub-all" href="https://www.tse.jus.br/eleicoes/eleicoes-2026" target="_blank" rel="noopener noreferrer">
            Abrir portal do TSE <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
          </a>
        </div>

        <div className="official-resource-grid">
          {[
            ['fontes','Fontes oficiais','Consulte dados e documentos diretamente no TSE.','https://dadosabertos.tse.jus.br/','search'],
            ['resultados','Resultados 2026','Informações oficiais sobre divulgação e resultados eleitorais.','https://resultados.tse.jus.br/','results'],
            ['urna','Simulador da urna','Treine a navegação e conheça a sequência da votação.','https://www.tse.jus.br/servicos-eleitorais/urna-eletronica/simulador-de-votacao','vote'],
            ['votar','Regras para votar','Orientações oficiais para o dia da votação.','https://www.tse.jus.br/eleicoes/eleicoes-2026','rules'],
            ['estatisticas','Estatísticas eleitorais','Dados e séries oficiais da Justiça Eleitoral.','https://www.tse.jus.br/eleicoes/estatisticas-eleitorais','stats'],
          ].map(([id,title,description,href,icon]) => (
            <a key={id} href={href} target="_blank" rel="noopener noreferrer" className="official-resource-card">
              <span className="official-resource-icon" aria-hidden="true">
                {icon === 'search' ? <SearchCheck className="h-5 w-5" /> :
                 icon === 'results' ? <Landmark className="h-5 w-5" /> :
                 icon === 'vote' ? <Smartphone className="h-5 w-5" /> :
                 icon === 'rules' ? <ClipboardCheck className="h-5 w-5" /> :
                 <SearchCheck className="h-5 w-5" />}
              </span>
              <span className="min-w-0 flex-1">
                <strong>{title}</strong>
                <small>{description}</small>
              </span>
              <ExternalLink className="official-resource-arrow h-4 w-4" aria-hidden="true" />
            </a>
          ))}
        </div>
      </div>

      <div className="official-hub civic-local-hub">
        <div className="official-hub-head">
          <div>
            <span className="official-hub-kicker">Águas Lindas · Prefeitura</span>
            <h3 className="official-hub-title">Serviços municipais</h3>
            <p className="official-hub-subtitle">Acesso direto a transparência, saúde, serviços e participação.</p>
          </div>
        </div>

        <div className="official-resource-grid official-resource-grid-local">
          {priorityPublicServices.slice(0, 8).map(({ icon: Icon, title, description, href }) => (
            <a key={title} href={href} target="_blank" rel="noopener noreferrer" className="official-resource-card">
              <span className="official-resource-icon" aria-hidden="true"><Icon className="h-5 w-5" /></span>
              <span className="min-w-0 flex-1"><strong>{title}</strong><small>{description}</small></span>
              <ExternalLink className="official-resource-arrow h-4 w-4" aria-hidden="true" />
            </a>
          ))}
        </div>

        <details className="official-more">
          <summary>Mais serviços oficiais <span>+{Math.max(0, priorityPublicServices.length - 8 + additionalPublicServices.length)} caminhos</span></summary>
          <div className="official-more-grid">
            {[...priorityPublicServices.slice(8), ...additionalPublicServices].map(({ icon: Icon, title, description, href, ...rest }) => (
              (() => {
                const cta = 'cta' in rest && typeof rest.cta === 'string' ? rest.cta : null;
                return (
              <a key={title} href={href} target="_blank" rel="noopener noreferrer" className="official-resource-card compact">
                <span className="official-resource-icon small" aria-hidden="true"><Icon className="h-4 w-4" /></span>
                <span className="min-w-0 flex-1"><strong>{title}</strong><small>{description}</small>{cta && <em>{cta}</em>}</span>
                <ExternalLink className="official-resource-arrow h-3.5 w-3.5" aria-hidden="true" />
              </a>
                );
              })()
            ))}
          </div>
        </details>
      </div>

      <div className="official-source-note">
        <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-300" aria-hidden="true" />
        <p><strong>Fonte oficial primeiro.</strong> O observatório organiza os caminhos; a execução do serviço e a informação original permanecem nos portais dos órgãos responsáveis.</p>
      </div>
    </section>
  );
}
