import { Check, Share2 } from '../components/icons.mjs';
import { useState } from 'react';

interface ShareDataButtonProps {
  readonly title: string;
  readonly text: string;
  readonly url: string;
  readonly compact?: boolean;
}

async function copyText(value: string) {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(value);
      return true;
    }
  } catch {}
  try {
    const textarea = document.createElement('textarea');
    textarea.value = value;
    textarea.setAttribute('readonly', '');
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    const copied = document.execCommand('copy');
    textarea.remove();
    return copied;
  } catch {
    return false;
  }
}

export function ShareDataButton({ title, text, url, compact = false }: ShareDataButtonProps) {
  const [status, setStatus] = useState('');
  const payload = text + '\n' + url;
  const buttonPadding = compact ? 'px-2.5' : 'px-3';

  const share = async () => {
    try {
      if (navigator.share) {
        await navigator.share({ title, text, url });
        setStatus('Compartilhado');
        window.setTimeout(() => setStatus(''), 1800);
        return;
      }
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') return;
    }

    const copied = await copyText(payload);
    setStatus(copied ? 'Link copiado' : 'Não foi possível compartilhar');
    window.setTimeout(() => setStatus(''), 1800);
  };

  const whatsappHref = 'https://wa.me/?text=' + encodeURIComponent(payload);

  return (
    <div className="inline-flex flex-wrap items-center gap-2">
      <button type="button" onClick={share} className={'inline-flex min-h-12 items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.03] ' + buttonPadding + ' py-2 text-xs font-bold text-slate-200 hover:border-sky-300/20 hover:text-white'} aria-label={'Compartilhar: ' + title}>
        {status ? <Check className="h-3.5 w-3.5 text-emerald-300" aria-hidden="true" /> : <Share2 className="h-3.5 w-3.5 text-sky-300" aria-hidden="true" />}
        {status || 'Compartilhar'}
      </button>
      <a href={whatsappHref} target="_blank" rel="noopener noreferrer" className={'inline-flex min-h-12 items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.03] ' + buttonPadding + ' py-2 text-xs font-bold text-slate-200 hover:border-sky-300/20 hover:text-white'} aria-label={'Compartilhar no WhatsApp: ' + title}>
        WhatsApp
      </a>
    </div>
  );
}
