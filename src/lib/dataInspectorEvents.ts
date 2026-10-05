export type InspectorDetail = {
  label: string;
  value: string;
  sourceId?: string;
  status?: string;
  referenceDate?: string;
  note?: string;
  method?: string;
  inspectId?: string;
  sectionId?: string;
};

export function inspectDataId(detail: Pick<InspectorDetail, 'label' | 'sourceId'>) {
  const slug = detail.label
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('pt-BR')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
  return (detail.sourceId ?? 'observatorio') + '--' + (slug || 'dado');
}

export function dispatchInspect(detail: InspectorDetail) {
  window.dispatchEvent(new CustomEvent('observatorio:inspect-data', {
    detail: { ...detail, inspectId: detail.inspectId ?? inspectDataId(detail) },
  }));
}
