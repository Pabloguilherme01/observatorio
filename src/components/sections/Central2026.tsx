import { ExternalLink, MapPin, MessageCircle, ShieldAlert } from 'lucide-react';
import { Card } from '../ui/Card';
import { SectionHeader } from '../ui/SectionHeader';

const items = [
  ['Local de votação', 'Consultar local no TSE/e-Título', 'https://www.tse.jus.br/eleicoes/eleicoes-2026'],
  ['PesqEle', 'Consultar registro de pesquisas', 'https://www.tse.jus.br/eleicoes/eleicoes-2026-content/pesquisas-eleitorais'],
  ['DivulgaCandContas', 'Candidaturas e contas de campanha', 'https://divulgacandcontas.tse.jus.br/'],
  ['Pardal', 'Registrar ou acompanhar denúncia eleitoral', 'https://pardal.tse.jus.br/'],
  ['Dados abertos', 'Baixar bases eleitorais oficiais', 'https://dadosabertos.tse.jus.br/dataset/groups/eleitorado-2026'],
  ['TSE no WhatsApp', 'Canal oficial de informação eleitoral', 'https://www.tse.jus.br/comunicacao/noticias/2026/Setembro/canal-do-tse-no-whatsapp-orienta-eleitorado-e-ajuda-a-combater-desinformacao'],
];

export function Central2026() {
  return <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6" aria-labelledby="central-title"><SectionHeader titleId="central-title" eyebrow="Central 2026" title="Acesso direto às fontes da eleição" description="O observatório funciona como camada de leitura; quando a informação precisa ser confirmada, o caminho oficial fica a um clique." />
    <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">{items.map(([label, description, href]) => <a key={label} href={href} target="_blank" rel="noreferrer" className="group flex gap-4 rounded-2xl border border-white/8 bg-white/[0.025] p-4 hover:border-sky-300/20"><div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-sky-300/10 text-sky-200">{label.includes('votação') ? <MapPin className="h-5 w-5" /> : label.includes('Pardal') ? <ShieldAlert className="h-5 w-5" /> : label.includes('WhatsApp') ? <MessageCircle className="h-5 w-5" /> : <ExternalLink className="h-5 w-5" />}</div><div><strong className="text-sm text-white">{label}</strong><p className="mt-1 text-xs leading-5 text-slate-500">{description}</p></div></a>)}</div>
  </section>;
}