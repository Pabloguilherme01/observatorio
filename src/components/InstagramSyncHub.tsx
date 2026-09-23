import { Camera, Check, Download, ExternalLink, Share2, Sparkles } from 'lucide-react';
import { useMemo, useState } from 'react';
import { observatorioData as d } from '../data/observatorioData';
import { EDITION } from '../config/version';
import { downloadBlob } from '../lib/export';

type Format = 'story' | 'post';
type SocialItem = { readonly id: string; readonly label: string; readonly value: string; readonly note: string; readonly anchor: string };

const items: readonly SocialItem[] = [
  { id: 'orcamento', label: 'LOA 2026', value: 'R$ ' + (d.budget.totalBrl / 1_000_000).toFixed(1).replace('.', ',') + ' mi', note: 'orçamento total informado', anchor: 'orcamento' },
  { id: 'eleitorado', label: 'Eleitorado 2026', value: d.electoral.electorate.toLocaleString('pt-BR'), note: 'snapshot local', anchor: 'eleitorado' },
  { id: 'transporte', label: 'Transporte', value: d.transport.routes[0]?.fareBrl.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) ?? 'R$ 0,00', note: 'trecho de referência para Brasília', anchor: 'transporte' },
  { id: 'saneamento', label: 'Saneamento', value: d.sanitation.publicSewerServicePct.toLocaleString('pt-BR', { maximumFractionDigits: 1 }) + '%', note: 'acesso ao serviço público de esgoto', anchor: 'saneamento' },
  { id: 'populacao', label: 'População 2026', value: (d.populationSeries.find(point => point.year === 2026)?.value ?? 0).toLocaleString('pt-BR'), note: 'estimativa IBGE', anchor: 'dashboard' },
];

function trackedUrl(anchor: string) {
  const url = new URL(window.location.origin + window.location.pathname);
  url.searchParams.set('utm_source', 'instagram');
  url.searchParams.set('utm_medium', 'organic');
  url.searchParams.set('utm_campaign', 'observatorio-v44');
  url.hash = anchor;
  return url.toString();
}

function wrapText(ctx: CanvasRenderingContext2D, value: string, maxWidth: number, maxLines = 3) {
  const words = value.split(' ');
  const lines: string[] = [];
  let line = '';
  for (const word of words) {
    const next = line ? line + ' ' + word : word;
    if (ctx.measureText(next).width <= maxWidth) line = next;
    else if (line) { lines.push(line); line = word; if (lines.length === maxLines - 1) break; }
    else { lines.push(word); line = ''; }
  }
  if (line && lines.length < maxLines) lines.push(line);
  return lines;
}

async function makeCard(item: SocialItem, format: Format) {
  const canvas = document.createElement('canvas');
  canvas.width = 1080;
  canvas.height = format === 'story' ? 1920 : 1350;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  ctx.fillStyle = '#0b1117';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const gradient = ctx.createRadialGradient(canvas.width * .86, 100, 20, canvas.width * .86, 100, 620);
  gradient.addColorStop(0, 'rgba(62,111,143,.42)');
  gradient.addColorStop(1, 'rgba(11,17,23,0)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = 'rgba(255,255,255,.08)';
  ctx.lineWidth = 2;
  for (let x = 60; x < canvas.width; x += 80) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke(); }
  for (let y = 0; y < canvas.height; y += 80) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke(); }

  ctx.fillStyle = '#8cc8f2';
  ctx.font = '700 28px Inter, Arial, sans-serif';
  ctx.fillText('OBSERVATÓRIO · ÁGUAS LINDAS', 72, format === 'story' ? 110 : 92);

  ctx.fillStyle = '#e6edf3';
  ctx.font = '900 ' + (format === 'story' ? 70 : 62) + 'px Inter, Arial, sans-serif';
  const titleLines = wrapText(ctx, item.label, 820, 2);
  titleLines.forEach((line, index) => ctx.fillText(line, 72, (format === 'story' ? 250 : 210) + index * 78));

  ctx.fillStyle = '#8cc8f2';
  ctx.font = '900 ' + (format === 'story' ? 118 : 100) + 'px Inter, Arial, sans-serif';
  ctx.fillText(item.value, 72, format === 'story' ? 520 : 450);

  ctx.fillStyle = '#94a3b8';
  ctx.font = '500 34px Inter, Arial, sans-serif';
  const noteLines = wrapText(ctx, item.note, 820, 3);
  noteLines.forEach((line, index) => ctx.fillText(line, 72, (format === 'story' ? 610 : 540) + index * 48));

  ctx.fillStyle = '#e6edf3';
  ctx.font = '700 30px Inter, Arial, sans-serif';
  ctx.fillText('Veja explicação, fonte e data no Observatório.', 72, canvas.height - 190);

  ctx.fillStyle = '#64748b';
  ctx.font = '500 24px Inter, Arial, sans-serif';
  ctx.fillText(EDITION + ' · dados públicos · conteúdo informativo', 72, canvas.height - 120);

  return new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/png'));
}

export function InstagramSyncHub() {
  const [selectedId, setSelectedId] = useState('orcamento');
  const [format, setFormat] = useState<Format>('story');
  const [status, setStatus] = useState('');
  const item = items.find(entry => entry.id === selectedId) ?? items[0];

  const caption = useMemo(() => (
    item.label + ' em Águas Lindas de Goiás.\n\n' +
    item.value + ' · ' + item.note + '.\n\n' +
    'Confira a explicação, a fonte e a data no Observatório.\n' +
    trackedUrl(item.anchor)
  ), [item]);

  const copyCaption = async () => {
    try {
      await navigator.clipboard.writeText(caption);
      setStatus('Legenda copiada');
    } catch {
      setStatus('Não foi possível copiar');
    }
    window.setTimeout(() => setStatus(''), 1800);
  };

  const generate = async (shareFirst: boolean) => {
    const blob = await makeCard(item, format);
    if (!blob) { setStatus('Canvas indisponível'); return; }

    const filename = 'observatorio-' + item.id + '-' + format + '-' + EDITION.toLowerCase() + '.png';
    if (shareFirst) {
      try {
        const file = new File([blob], filename, { type: 'image/png' });
        if (navigator.share && navigator.canShare?.({ files: [file] })) {
          await navigator.share({
            title: item.label + ' · Observatório',
            text: item.value + ' · ' + item.note,
            url: trackedUrl(item.anchor),
            files: [file],
          });
          setStatus('Conteúdo enviado ao compartilhamento');
          window.setTimeout(() => setStatus(''), 1800);
          return;
        }
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') return;
      }
    }

    downloadBlob(filename, blob, 'image/png');
    setStatus(format === 'story' ? 'Story gerado' : 'Post gerado');
    window.setTimeout(() => setStatus(''), 1800);
  };

  return (
    <section id="instagram" className="mx-auto max-w-7xl px-4 py-10 sm:px-6" aria-labelledby="instagram-title">
      <div className="instagram-shell">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] text-sky-300/80">
              <Camera className="h-3.5 w-3.5" aria-hidden="true" /> Distribuição social
            </div>
            <h2 id="instagram-title" className="mt-2 text-2xl font-black text-white sm:text-3xl">Distribuição no Instagram</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">Gere uma peça, copie a legenda e abra seu Instagram. No celular, o compartilhamento nativo reduz passos.</p>
          </div>
          <a href="https://www.instagram.com/pablo.builds.ia?utm_source=ig_web_button_share_sheet&stkn=ZDNlZDc0MzIxNw==" target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-xs font-bold text-slate-200 hover:border-sky-300/20">
            @pablo.builds.ia <ExternalLink className="h-4 w-4" aria-hidden="true" />
          </a>
        </div>

        <div className="mt-5 grid gap-4 lg:grid-cols-[.8fr_1.2fr]">
          <div className="instagram-mobile-rail gap-2">
            <div className="instagram-mobile-column">
              <div className="text-[11px] font-bold uppercase tracking-widest text-slate-500">1 · Escolha o dado</div>
              <div className="mt-3 grid gap-2">
                {items.map(entry => (
                  <button key={entry.id} type="button" onClick={() => setSelectedId(entry.id)} aria-pressed={selectedId === entry.id} className={'rounded-2xl border p-3 text-left ' + (selectedId === entry.id ? 'border-sky-300/25 bg-sky-300/10' : 'border-white/8 bg-white/[0.02]')}>
                    <span className="block text-xs font-bold text-white">{entry.label}</span>
                    <span className="mt-1 block text-[11px] text-slate-500">{entry.value} · {entry.note}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="instagram-mobile-column">
              <div className="text-[11px] font-bold uppercase tracking-widest text-slate-500">2 · Formato</div>
              <div className="mt-3 flex flex-wrap gap-2">
                <button type="button" onClick={() => setFormat('story')} aria-pressed={format === 'story'} className={'min-h-11 rounded-xl border px-3 py-2 text-xs font-bold ' + (format === 'story' ? 'border-sky-300/25 bg-sky-300/10 text-sky-200' : 'border-white/10 text-slate-400')}>Story · 1080×1920</button>
                <button type="button" onClick={() => setFormat('post')} aria-pressed={format === 'post'} className={'min-h-11 rounded-xl border px-3 py-2 text-xs font-bold ' + (format === 'post' ? 'border-sky-300/25 bg-sky-300/10 text-sky-200' : 'border-white/10 text-slate-400')}>Post · 1080×1350</button>
              </div>

              <div className="mt-5 rounded-3xl border border-sky-300/10 bg-sky-300/[0.04] p-4">
                <div className="flex items-center gap-2 text-xs font-bold text-sky-200"><Sparkles className="h-4 w-4" aria-hidden="true" /> {item.label}</div>
                <div className="mt-3 text-4xl font-black text-white">{item.value}</div>
                <p className="mt-2 text-sm text-slate-400">{item.note}</p>
                <p className="mt-4 whitespace-pre-line text-xs leading-5 text-slate-500">{caption}</p>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <button type="button" onClick={() => generate(false)} className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-sky-300 px-4 py-2 text-xs font-black text-slate-950">
                  <Download className="h-4 w-4" aria-hidden="true" /> Gerar {format === 'story' ? 'Story' : 'Post'}
                </button>
                <button type="button" onClick={() => generate(true)} className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2 text-xs font-bold text-slate-200 hover:border-sky-300/20">
                  <Share2 className="h-4 w-4" aria-hidden="true" /> Enviar para compartilhar
                </button>
                <button type="button" onClick={copyCaption} className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2 text-xs font-bold text-slate-200 hover:border-sky-300/20">
                  {status === 'Legenda copiada' ? <Check className="h-4 w-4 text-emerald-300" aria-hidden="true" /> : <Share2 className="h-4 w-4 text-sky-300" aria-hidden="true" />} {status || 'Copiar legenda'}
                </button>
              </div>
              <p className="mt-3 text-[11px] leading-5 text-slate-600">A integração aqui é assistida: o navegador gera o arquivo e usa o compartilhamento do aparelho. Publicação automática na conta do Instagram exigiria autenticação e infraestrutura da API da Meta.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
