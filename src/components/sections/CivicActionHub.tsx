import { ClipboardCheck, ExternalLink, FileQuestion, Landmark, MessageCircle, Scale, Smartphone, SearchCheck } from '../../components/icons.mjs';
import { Card } from '../ui/Card';
import { SectionHeader } from '../ui/SectionHeader';

const actions = [
  {
    icon: FileQuestion,
    title: 'Pedir informação',
    description: 'Use o SIC da Prefeitura para solicitar documentos, contratos, despesas ou esclarecimentos sobre dados públicos.',
    href: 'https://aguaslindasdegoias.go.gov.br/servico-de-informacao-ao-cidadao/',
    cta: 'Acessar SIC da Prefeitura',
  },
  {
    icon: Landmark,
    title: 'Acompanhar o Legislativo',
    description: 'Consulte sessões, pautas, atas, leis e o portal de transparência da Câmara Municipal.',
    href: 'https://camaradeaguaslindas.go.gov.br/',
    cta: 'Acessar Câmara Municipal',
  },
  {
    icon: ClipboardCheck,
    title: 'Conferir a execução',
    description: 'O Portal da Transparência municipal reúne despesas, contratos, licitações, obras, receitas e prestação de contas.',
    href: 'https://aguaslindasdegoias.go.gov.br/transparencia/',
    cta: 'Abrir Transparência',
  },
  {
    icon: Scale,
    title: 'Enviar manifestação',
    description: 'O TCMGO mantém Ouvidoria e SIC para solicitações, reclamações e comunicações relacionadas ao controle municipal.',
    href: 'https://www.tcmgo.tc.br/site/ouvidoria/',
    cta: 'Acessar Ouvidoria TCMGO',
  },
  {
    icon: Smartphone,
    title: 'Usar o e-Título',
    description: 'Aplicativo oficial da Justiça Eleitoral para serviços como título digital, local de votação, justificativa e certidões.',
    href: 'https://www.tse.jus.br/servicos-eleitorais/servicos/aplicativo-e-titulo',
    cta: 'Abrir e-Título',
  },
  {
    icon: SearchCheck,
    title: 'Consultar candidaturas e contas',
    description: 'O TSE disponibiliza o DivulgaCandContas para consultar candidaturas, situação de registro e informações de contas eleitorais.',
    href: 'https://divulgacandcontas.tse.jus.br/divulga/#/',
    cta: 'Abrir DivulgaCandContas',
  },
  {
    icon: Smartphone,
    title: 'Consultar o Pardal',
    description: 'Ferramenta oficial do TSE para encaminhar e acompanhar denúncias de propaganda eleitoral irregular.',
    href: 'https://www.tse.jus.br/servicos-eleitorais/servicos/pardal',
    cta: 'Ver instruções do TSE',
  },
  {
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

      <div className="grid gap-4 lg:grid-cols-[1fr_.72fr]">
        <div className="grid gap-3 sm:grid-cols-2">
          {actions.map(({ icon: Icon, title, description, href, cta }) => (
            <Card key={title} className="p-5">
              <div className="flex items-start gap-3">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl border border-sky-300/10 bg-sky-300/[0.06] text-sky-200">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <div>
                  <h3 className="text-base font-black text-white light:text-slate-900">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-400 light:text-slate-600">{description}</p>
                  <a href={href} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex min-h-11 items-center gap-1.5 text-xs font-bold text-sky-300 hover:text-sky-200">
                    {cta} <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                  </a>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <Card className="p-6">
          <div className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">Compartilhe sem editar</div>
          <h3 className="mt-2 text-2xl font-black text-white light:text-slate-900">Leve a fonte junto com o link</h3>
          <p className="mt-3 text-sm leading-6 text-slate-400 light:text-slate-600">
            O compartilhamento carrega o endereço do observatório para que a pessoa possa abrir a evidência, consultar a origem e continuar a leitura por conta própria.
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
