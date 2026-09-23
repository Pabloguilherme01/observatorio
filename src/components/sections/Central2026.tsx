import { CalendarDays, ExternalLink, MapPin, MessageCircle, ShieldAlert } from 'lucide-react';
import { Card } from '../ui/Card';
import { SectionHeader } from '../ui/SectionHeader';

const timeline = [
  ['06 mai', 'Fechamento do cadastro eleitoral', 'Último dia para alistamento, transferência e atualização cadastral.'],
  ['15 ago', 'Registro de candidaturas', 'Prazo final até 19h para requerer os registros.'],
  ['16 ago', 'Início da propaganda eleitoral', 'Propaganda eleitoral geral passa a ser permitida.'],
  ['04 out', '1º turno', 'Votação das 8h às 17h, no horário de Brasília.'],
  ['25 out', '2º turno', 'Data prevista para eventual segundo turno.'],
];

const items = [
  ['Onde votar', 'Consultar seu local de votação no TSE ou no e-Título', 'https://www.tse.jus.br/servicos-eleitorais/local-de-votacao-zonas-eleitorais'],
  ['PesqEle', 'Consultar registro de pesquisas', 'https://www.tse.jus.br/eleicoes/eleicoes-2026-content/pesquisas-eleitorais'],
  ['DivulgaCandContas', 'Candidaturas e contas de campanha', 'https://divulgacandcontas.tse.jus.br/'],
  ['Pardal', 'Registrar ou acompanhar denúncia eleitoral', 'https://pardal.tse.jus.br/'],
  ['Dados abertos', 'Baixar bases eleitorais oficiais', 'https://dadosabertos.tse.jus.br/dataset/groups/eleitorado-2026'],
  ['TSE no WhatsApp', 'Canal oficial de informação eleitoral', 'https://www.tse.jus.br/comunicacao/noticias/2026/Setembro/canal-do-tse-no-whatsapp-orienta-eleitorado-e-ajuda-a-combater-desinformacao'],
];

export function Central2026() {
  return <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6" aria-labelledby="central-title"><SectionHeader titleId="central-title" eyebrow="Central 2026" title="Acesso direto às fontes da eleição" description="O observatório funciona como camada de leitura; quando a informação precisa ser confirmada, o caminho oficial fica a um clique." />
    <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">{items.map(([label, description, href]) => <a key={label} href={href} target="_blank" rel="noreferrer" className="group flex gap-4 rounded-2xl border border-white/8 bg-white/[0.025] p-4 hover:border-sky-300/20"><div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-sky-300/10 text-sky-200">{label === 'Onde votar' ? <MapPin className="h-5 w-5" /> : label.includes('Pardal') ? <ShieldAlert className="h-5 w-5" /> : label.includes('WhatsApp') ? <MessageCircle className="h-5 w-5" /> : <ExternalLink className="h-5 w-5" />}</div><div><strong className="text-sm text-white">{label}</strong><p className="mt-1 text-xs leading-5 text-slate-500">{description}</p></div></a>)}</div>
    <div className="mt-8 rounded-3xl border border-white/10 bg-white/[0.02] p-5">
      <div className="flex items-center gap-2">
        <CalendarDays className="h-4 w-4 text-sky-300" aria-hidden="true" />
        <h3 className="text-sm font-black text-white">Linha do tempo oficial</h3>
      </div>
      <div className="mt-5 grid gap-3 md:grid-cols-5">
        {timeline.map(([date, title, description]) => (
          <div key={date} className="relative rounded-2xl border border-white/8 bg-black/10 p-4">
            <div className="text-lg font-black text-sky-300">{date}</div>
            <div className="mt-2 text-sm font-bold text-white">{title}</div>
            <p className="mt-2 text-xs leading-5 text-slate-500">{description}</p>
          </div>
        ))}
      </div>
    </div>
  </section>;
}