# Observatório Eleitoral — Águas Lindas de Goiás 2026

Aplicação web de dados públicos e contexto municipal, migrada do artefato HTML monolítico para Vite + React + TypeScript + Tailwind CSS + Lucide React.

## Stack
- Vite
- React
- TypeScript strict
- Tailwind CSS v4
- Lucide React

## Estrutura
- `src/components`: UI modular
- `src/data`: dados e proveniência
- `src/lib`: cálculos puros
- `src/services`: fronteira para integrações futuras

## Desenvolvimento
```bash
npm install
npm run dev
```

## Verificação
```bash
npm run typecheck
npm run build
```

## Princípios de dados
- Diferenciar fonte oficial, secundária, derivada e legado.
- Preservar ano-base e data de atualização.
- Não transformar cálculos derivados em dados observados.
- Manter links para as fontes originais.

## Deploy
Compatível com Vercel, Netlify e hospedagem estática que execute o build do Vite.

## Status
V22 React — migração modular em andamento.
