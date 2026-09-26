import { BriefcaseBusiness, Building2, CheckCircle2, ClipboardCheck, Droplets, ExternalLink, FileQuestion, GraduationCap, Landmark, MessageCircle, Pill, ReceiptText, Scale, SearchCheck, ShieldCheck, Smartphone, Stethoscope, WalletCards } from 'lucide-react';
import { useLanguageMode } from '../../context/LanguageModeContext';
import { SectionHeader } from '../ui/SectionHeader';

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
  { icon: Droplets, title: 'Água e esgoto — atendimento', description: 'Acesse os canais oficiais da Saneago para atendimento, ocorrências e serviços de abastecimento e esgotamento sanitário.', href: 'https://www.saneago.com.br/site/atendimentos/atendimento_telefone_estado_goias' },
  { icon: ShieldCheck, title: 'Conselho Tutelar', description: 'Consulte endereço, horário e contato oficial do Conselho Tutelar.', href: 'https://aguaslindasdegoias.go.gov.br/estrutura/secretaria-de-assistencia-social-cidadania-e-juventude/conselho-tutelar/' },
  { icon: Stethoscope, title: 'CAPS', description: 'Consulte endereço, horário e contato oficial do Centro de Atenção Psicossocial.', href: 'https://aguaslindasdegoias.go.gov.br/estrutura/secretaria-de-saude-2/caps-centro-de-atencao-psicossocial/' },
  { icon: Stethoscope, title: 'SAMU', description: 'Acesse o serviço oficial e o número de emergência 192.', href: 'https://aguaslindasdegoias.go.gov.br/estrutura/secretaria-de-saude-2/samu-servico-de-atendimento-movel-de-urgencia/' },
  { icon: Smartphone, title: 'Portal SEI · Pessoa com deficiência', description: 'Localize a unidade municipal responsável pelas políticas e atendimento à pessoa com deficiência.', href: 'https://portalsei.aguaslindasdegoias.go.gov.br/' },
  { icon: ShieldCheck, title: 'Portal SEI · Proteção e bem-estar animal', description: 'Localize o FUBEM e o Canil Municipal na estrutura oficial do município.', href: 'https://portalsei.aguaslindasdegoias.go.gov.br/' },
  { icon: Smartphone, title: 'Trânsito e mobilidade urbana', description: 'Consulte a Secretaria Municipal de Trânsito e Mobilidade Urbana, contatos e horários oficiais.', href: 'https://aguaslindasdegoias.go.gov.br/estrutura/secretaria-de-transito-e-mobilidade-urbana/' },
] as const;

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


export function CivicActionHub() {
  const { mode } = useLanguageMode();
  const technical = mode === 'technical';
  const tesser = [
    ['situacao','Consultar situação eleitoral','Acesse situação do título, local de votação e serviços disponíveis.','https://www.tse.jus.br/servicos-eleitorais/titulo-eleitoral/autoatendimento-eleitoral','service'],
    ['candidaturas','Candidaturas e contas','Consulte registros, bens, receitas e despesas no DivulgaCandContas.','https://divulgacandcontas.tse.jus.br/divulga/#/','search'],
    ['resultados','Resultados oficiais','Acompanhe a divulgação oficial quando houver dados publicados.','https://resultados.tse.jus.br/','results'],
    ['eleicoes2026','Portal Eleições 2026','Calendário, orientações, estatísticas e serviços da Justiça Eleitoral.','https://www.tse.jus.br/eleicoes/eleicoes-2026','rules'],
    ['justificativa','Justificar ausência','Consulte as formas e os prazos oficiais para justificativa eleitoral.','https://www.tse.jus.br/servicos-eleitorais/justificativa-eleitoral','rules'],
    ['certidoes','Emitir certidões eleitorais','Acesse certidões e validações disponibilizadas pela Justiça Eleitoral.','https://www.tse.jus.br/servicos-eleitorais/certidoes','service'],
    ['multas','Quitar débitos eleitorais','Consulte orientações oficiais para débitos e multas eleitorais.','https://www.tse.jus.br/servicos-eleitorais/titulo-eleitoral/quitacao-de-multas','service'],
    ['dadosabertos','Dados abertos do TSE','Bases públicas para conferência e análise técnica.','https://dadosabertos.tse.jus.br/','data'],
  ];
  const visiblePriority = technical ? priorityPublicServices.slice(0, 8) : priorityPublicServices.slice(0, 6);
  return (
    <section id="acao" className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16" aria-labelledby="action-title">
      <SectionHeader
        titleId="action-title"
        eyebrow="Depois de ler"
        title="Como usar o dado"
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
          {tesser.slice(0, technical ? tesser.length : 4).map(([id,title,description,href,icon]) => (
            <a key={id} href={href} target="_blank" rel="noopener noreferrer" className="official-resource-card">
              <span className="official-resource-icon" aria-hidden="true">
                {icon === 'search' ? <SearchCheck className="h-5 w-5" /> :
                 icon === 'results' ? <Landmark className="h-5 w-5" /> :
                 icon === 'service' ? <Smartphone className="h-5 w-5" /> :
                 icon === 'rules' ? <ClipboardCheck className="h-5 w-5" /> :
                 <ShieldCheck className="h-5 w-5" />}
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
          {visiblePriority.map(({ icon: Icon, title, description, href }) => (
            <a key={title} href={href} target="_blank" rel="noopener noreferrer" className="official-resource-card">
              <span className="official-resource-icon" aria-hidden="true"><Icon className="h-5 w-5" /></span>
              <span className="min-w-0 flex-1"><strong>{title}</strong><small>{description}</small></span>
              <ExternalLink className="official-resource-arrow h-4 w-4" aria-hidden="true" />
            </a>
          ))}
        </div>

        {technical && <details className="official-more">
          <summary>Mais serviços oficiais <span>+{Math.max(0, priorityPublicServices.length - 8 + additionalPublicServices.length)} caminhos</span></summary>
          <div className="official-more-grid">
            {[...priorityPublicServices.slice(8), ...additionalPublicServices].map(service => {
              const Icon = service.icon;
              const cta = 'cta' in service && typeof service.cta === 'string' ? service.cta : null;
              return (
                <a key={service.title} href={service.href} target="_blank" rel="noopener noreferrer" className="official-resource-card compact">
                  <span className="official-resource-icon small" aria-hidden="true"><Icon className="h-4 w-4" /></span>
                  <span className="min-w-0 flex-1"><strong>{service.title}</strong><small>{service.description}</small>{cta && <em>{cta}</em>}</span>
                  <ExternalLink className="official-resource-arrow h-3.5 w-3.5" aria-hidden="true" />
                </a>
              );
            })}
          </div>
        </details>}
      </div>

      <div className="official-source-note">
        <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-300" aria-hidden="true" />
        <p><strong>Fonte oficial primeiro.</strong> O observatório organiza os caminhos; a execução do serviço e a informação original permanecem nos portais dos órgãos responsáveis.</p>
      </div>
    </section>
  );
}
