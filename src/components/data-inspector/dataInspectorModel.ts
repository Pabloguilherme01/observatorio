import { formatIndicatorStatus } from '../../utils/dataLabels';
import type { InspectorDetail } from '../../lib/dataInspectorEvents';
import { observatorioData as d } from '../../data/observatorioData';

export type InspectorSource = (typeof d.sources)[number];

function publicDate(value?: string) {
  if (!value) return undefined;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return value;
  return `${match[3]}/${match[2]}/${match[1]}`;
}

export function buildDataInspectorModel(
  data: InspectorDetail,
  source: InspectorSource | undefined,
  canonicalUrl: string,
) {
  const effectiveReferenceDate = data.referenceDate ?? source?.referenceDate;
  const effectiveNote = data.note ?? source?.note;
  const statusLabel = formatIndicatorStatus(data.status);
  const referenceLabel = publicDate(effectiveReferenceDate);
  const sourcePublishedLabel = publicDate(source?.publishedAt);
  const sourceCheckedLabel = publicDate(source?.lastCheckedAt);

  const text = [
    data.label,
    data.value,
    source ? `Fonte: ${source.institution} — ${source.label}` : '',
    statusLabel ? `Natureza/status: ${statusLabel}` : '',
    referenceLabel ? `Referência: ${referenceLabel}` : 'Referência: não informada',
    sourcePublishedLabel ? `Publicação da fonte: ${sourcePublishedLabel}` : '',
    sourceCheckedLabel ? `Fonte verificada em: ${sourceCheckedLabel}` : '',
    data.method ? `Método: ${data.method}` : '',
    effectiveNote ?? '',
  ].filter(Boolean).join('\n');

  const citation = [
    `${data.label}: ${data.value}.`,
    source ? `Fonte: ${source.institution} — ${source.label}.` : '',
    referenceLabel ? `Referência: ${referenceLabel}.` : '',
    source?.url ? `URL: ${source.url}` : '',
  ].filter(Boolean).join(' ');

  const correctionBody = [
    '## Dado a verificar',
    `- Indicador: ${data.label}`,
    `- Valor exibido: ${data.value}`,
    `- Fonte: ${source ? `${source.institution} — ${source.label}` : 'não informada'}`,
    `- Referência: ${referenceLabel ?? 'não informada'}`,
    `- Link para o contexto: ${canonicalUrl}`,
    '',
    '## O que deve ser conferido?',
    'Descreva a correção, atualização ou evidência sugerida. Não inclua dados pessoais.',
  ].join('\n');

  const correctionUrl = new URL('https://github.com/Pabloguilherme01/observatorio/issues/new');
  correctionUrl.searchParams.set('title', `Revisar dado: ${data.label}`);
  correctionUrl.searchParams.set('labels', 'correcao');
  correctionUrl.searchParams.set('body', correctionBody);

  return {
    effectiveReferenceDate,
    effectiveNote,
    statusLabel,
    referenceLabel,
    sourcePublishedLabel,
    sourceCheckedLabel,
    text,
    citation,
    correctionUrl: correctionUrl.toString(),
  };
}
