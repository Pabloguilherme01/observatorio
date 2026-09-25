import { BriefcaseBusiness, Building2, CheckCircle2, ClipboardCheck, ExternalLink, FileQuestion, GraduationCap, Landmark, MessageCircle, Pill, ReceiptText, Scale, SearchCheck, Smartphone, Stethoscope, WalletCards } from 'lucide-react';
import { Card } from '../ui/Card';
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
    href: 'https://legislacao.aguaslindasdegoias.go.gov.br/',
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
    description: 'Confira no Autoatendimento Eleitoral o número, a situação do título, débitos e onde votar.',
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
    href: 'https://www.tse.jus.br/servicos-eleitorais/servicos/pardal',
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

function shareWhatsApp() {
  const url = window.location.href;
  const text = `Observatório Eleitoral — Águas Lindas de Goiás 2026. Dados públicos com fontes e limitações visíveis. ${url}`;
  window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank', 'noopener,noreferrer');
}

export function CivicActionHub() {
  return (
    <section id="acao" className="mx-auto max-w-7xl px-4 py-14 sm:px-6" aria-labelledby="action-title">
      <SectionHeader
        titleId="action-title"
        eyebrow="Depois de ler"
        title="Como usar o dado"
        description="O observatório informa e aponta caminhos oficiais. Ele não recebe denúncias, apura fatos nem substitui os órgãos públicos."
      />

      <Card className="mb-4 p-4 sm:p-5">
        <div className="flex items-start gap-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl border border-emerald-300/10 bg-emerald-300/[0.06] text-emerald-200">
            <CheckCircle2 className="h-5 w-5" aria-hidden="true" />
          </span>
          <div>
            <h3 className="text-base font-black text-white light:text-slate-900">Atalhos de utilidade pública</h3>
            <p className="mt-1 text-sm leading-6 text-slate-400 light:text-slate-600">
              Acesse diretamente serviços municipais que normalmente exigem vários passos no portal oficial.
            </p>
          </div>
        </div>
        <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {priorityPublicServices.map(({ icon: Icon, title, description, href }) => (
            <a key={title} href={href} target="_blank" rel="noopener noreferrer"
              className="group min-h-24 rounded-2xl border border-white/8 bg-white/[0.025] p-3 transition hover:border-sky-300/20 hover:bg-white/[0.05] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300"
              aria-label={`${title}: ${description}`}>
              <span className="flex items-center gap-2 text-sm font-black text-white light:text-slate-900">
                <Icon className="h-4 w-4 text-sky-300" aria-hidden="true" />{title}
                <ExternalLink className="ml-auto h-3.5 w-3.5 text-slate-500 group-hover:text-sky-300" aria-hidden="true" />
              </span>
              <span className="mt-1 block text-[11px] leading-5 text-slate-500">{description}</span>
            </a>
          ))}
        </div>
      </Card>

      <div className="grid gap-4 lg:grid-cols-[1fr_.72fr]">
        <div className="space-y-5">
          {(['Prefeitura', 'Saúde', 'Transparência e controle', 'Participação e controle', 'Eleições 2026'] as const).map(category => (
            <div key={category}>
              <h3 className="mb-2 text-xs font-black uppercase tracking-[0.14em] text-slate-500">{category}</h3>
              <div className="grid gap-3 sm:grid-cols-2">
                {actions.filter(action => action.category === category).map(({ icon: Icon, title, description, href, cta }) => (
                  <Card key={title} className="p-5">
                    <div className="flex items-start gap-3">
                      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl border border-sky-300/10 bg-sky-300/[0.06] text-sky-200">
                        <Icon className="h-5 w-5" aria-hidden="true" />
                      </span>
                      <div>
                        <h4 className="text-base font-black text-white light:text-slate-900">{title}</h4>
                        <p className="mt-2 text-sm leading-6 text-slate-400 light:text-slate-600">{description}</p>
                        <a href={href} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex min-h-11 items-center gap-1.5 text-xs font-bold text-sky-300 hover:text-sky-200">
                          {cta} <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                        </a>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>

        <Card className="p-6">
          <div className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">Fonte + caminho oficial</div>
          <h3 className="mt-2 text-2xl font-black text-white light:text-slate-900">Leve a fonte junto com o link</h3>
          <p className="mt-3 text-sm leading-6 text-slate-400 light:text-slate-600">
            O compartilhamento carrega o endereço do observatório. Os atalhos acima levam diretamente aos portais oficiais e continuam sendo a referência para executar o serviço.
          </p>
          <button type="button" onClick={shareWhatsApp} className="mt-6 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-sky-300 px-4 py-3 text-sm font-black text-slate-950 transition hover:bg-sky-200">
            <MessageCircle className="h-4 w-4" aria-hidden="true" /> Compartilhar no WhatsApp
          </button>
          <p className="mt-3 text-[11px] leading-5 text-slate-500">O observatório é uma fonte de consulta. O conteúdo compartilhado não substitui a fonte oficial citada em cada seção.</p>
        </Card>
      </div>
    </section>
  );
}
