import { ArrowRight, BarChart3, Database, Search, Sparkles } from 'lucide-react';
import { navigation } from '../config/navigation';

const cards = [
  { id: 'dashboard', title: 'Veja o essencial', description: 'Uma leitura rápida dos principais números e tendências.', icon: BarChart3 },
  { id: 'eleitoral360', title: 'Explore o Eleitoral 360°', description: 'Registros, snapshots, integridade e mudanças documentais.', icon: Search },
  { id: 'dados', title: 'Descubra os dados', description: 'Acompanhe o que entrou no observatório e de onde veio.', icon: Database },
  { id: 'fontes', title: 'Verifique as evidências', description: 'Abra as fontes utilizadas e acompanhe a proveniência.', icon: Sparkles },
];

export function DiscoveryHub() {
  const go = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    window.history.replaceState(null, '', '#' + id);
  };

  return (
    <section className="mx-auto max-w-7xl px-4 pb-10 sm:px-6" aria-labelledby="discovery-title">
      <div className="discovery-shell">
        <div className="max-w-2xl">
          <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-sky-300/80">Explore do seu jeito</div>
          <h2 id="discovery-title" className="mt-2 text-2xl font-black tracking-tight text-white md:text-3xl">Por onde você quer começar?</h2>
          <p className="mt-2 text-sm leading-6 text-slate-400">Escolha uma trilha e vá direto ao assunto. Você pode mudar de caminho a qualquer momento.</p>
        </div>
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {cards.map(({ id, title, description, icon: Icon }) => {
            const item = navigation.find(nav => nav.id === id);
            return <button key={id} type="button" onClick={() => go(id)} className="discovery-card">
              <span className="grid h-10 w-10 place-items-center rounded-2xl bg-sky-300/10 text-sky-200"><Icon className="h-5 w-5" aria-hidden="true" /></span>
              <span className="mt-4 flex items-center justify-between gap-2 text-left">
                <strong>{title}</strong><ArrowRight className="h-4 w-4 shrink-0 text-slate-600 transition group-hover:text-sky-300" />
              </span>
              <span className="mt-2 block text-left text-xs leading-5 text-slate-500">{description}</span>
              {item && <span className="mt-4 block text-left text-[10px] font-bold uppercase tracking-wider text-slate-600">{item.shortcut}</span>}
            </button>;
          })}
        </div>
      </div>
    </section>
  );
}
