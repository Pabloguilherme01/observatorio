export type InstallPrompt = {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
};

/** Falhas nativas do prompt não podem gerar rejeição sem tratamento no PWA. */
export async function attemptPwaInstall(event: InstallPrompt): Promise<'accepted' | 'dismissed' | 'unavailable'> {
  try {
    await event.prompt();
    const choice = await event.userChoice;
    return choice.outcome === 'accepted' ? 'accepted' : 'dismissed';
  } catch {
    // Browser negou o prompt ou cancelou sua promessa: permitir instrução manual.
    return 'unavailable';
  }
}
