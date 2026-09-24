export function QuizAccessButton() {
  return (
    <a
      href="#quiz"
      className="fixed bottom-5 right-5 z-50 flex min-h-12 items-center gap-2 rounded-full border border-sky-300/30 bg-sky-300 px-5 py-3 text-sm font-black text-slate-950 shadow-xl transition hover:scale-105"
      aria-label="Ir para o Quiz do Observatório"
    >
      <span aria-hidden="true">🧠</span>
      <span>Fazer Quiz</span>
    </a>
  );
}
