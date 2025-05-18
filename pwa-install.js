let deferredPrompt;
const installButton = document.getElementById('install-button');

// Nascondi il pulsante se non supportato
if (!window.matchMedia('(display-mode: standalone)').matches && installButton) {
  installButton.style.display = 'none';
}

window.addEventListener('beforeinstallprompt', (event) => {
  event.preventDefault();
  deferredPrompt = event;
  if (installButton) installButton.style.display = 'block';
});

if (installButton) {
  installButton.addEventListener('click', async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      try {
        const choiceResult = await deferredPrompt.userChoice;
        if (choiceResult.outcome === 'accepted') {
          console.log('User accepted the install prompt');
        } else {
          console.log('User dismissed the install prompt');
        }
      } catch (e) {
        console.error('Install prompt error:', e);
      }
      deferredPrompt = null;
      installButton.style.display = 'none';
    }
  });
}

window.addEventListener('appinstalled', () => {
  console.log('PWA installed');
  if (installButton) installButton.style.display = 'none';
});

// Nascondi il pulsante se già installata (standalone)
window.addEventListener('DOMContentLoaded', () => {
  if (window.matchMedia('(display-mode: standalone)').matches && installButton) {
    installButton.style.display = 'none';
  }
});