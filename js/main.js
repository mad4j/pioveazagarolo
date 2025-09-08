// Entry point modulare principale
import { displayData, showToast } from './modules/ui.js';
import { loadCachedData, saveCachedData } from './modules/cache.js';
import { precipitationManager } from './modules/precipitation.js';
import { PullToRefresh } from './modules/pull-to-refresh.js';
import './modules/debug-mobile.js';

async function retrieveData() {
  try {
    const randomQuery = `?nocache=${Math.floor(Date.now() / (60 * 1000))}`;
    const response = await fetch(`data.json${randomQuery}`);
    if (!response.ok) throw new Error('Errore nel caricamento dei dati meteo');
    const data = await response.json();
    
    // Load actual precipitation data
    await precipitationManager.loadActualData();
    
    displayData(data);
    saveCachedData(data);
  } catch (e) {
    console.error('Errore:', e);
    const cached = loadCachedData();
    if (cached) {
      // Try to load precipitation data even from cache
      await precipitationManager.loadActualData();
      displayData(cached.data);
    } else {
      showToast('Errore rete. Ritento fra 60 secondi...', 'error');
    }
    setTimeout(retrieveData, 60_000);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const offlineBadge = document.getElementById('offline-badge');
  const updateOfflineBadge = () => { if (!offlineBadge) return; offlineBadge.hidden = navigator.onLine; };
  window.addEventListener('online', () => { updateOfflineBadge(); showToast('Connessione ripristinata', 'success', 3000, true); retrieveData(); });
  window.addEventListener('offline', () => { updateOfflineBadge(); showToast('Sei offline: dati da cache', 'info', 4000, true); });
  updateOfflineBadge();
  const cached = loadCachedData(); 
  if (cached) {
    // Load precipitation data and then display
    precipitationManager.loadActualData().then(() => {
      displayData(cached.data);
    });
  }
  retrieveData();
  setInterval(retrieveData, 30 * 60 * 1000);

  // Initialize pull-to-refresh functionality
  const pullToRefresh = new PullToRefresh({
    onRefresh: async () => {
      await retrieveData();
    },
    threshold: 80,
    maxPull: 150,
    resistance: 2.5
  });

  // Fallback: prevent accidental text selection when clicking/tapping weather cards
  try {
    const disableSelection = (e) => e.preventDefault();
    const cards = document.querySelectorAll('.forecast-card, .current-conditions-card');
    cards.forEach(card => {
      // Modern browsers support 'user-select: none' via CSS; prevent selectionstart as extra safety
      card.addEventListener('selectstart', disableSelection);
      // On touch devices some browsers still allow long-press selection; prevent default on mousedown/touchstart
      card.addEventListener('mousedown', (ev) => ev.preventDefault());
      card.addEventListener('touchstart', (ev) => ev.preventDefault(), { passive: false });
    });
  } catch (err) { /* non-fatal */ }
});

if ('serviceWorker' in navigator) {
  const updateBtn = document.getElementById('update-button');
  navigator.serviceWorker.register('service-worker.js').then(registration => {
    console.log('Service Worker registrato con successo:', registration.scope);
    function showUpdateButton(sw){ 
      if(!updateBtn) return; 
      updateBtn.style.display='inline-flex'; 
      updateBtn.onclick=()=>{ 
        if(sw && sw.state==='installed') sw.postMessage('SKIP_WAITING'); 
      }; 
    }
    if (registration.waiting) showUpdateButton(registration.waiting);
    registration.addEventListener('updatefound', () => { const nw=registration.installing; if(!nw) return; nw.addEventListener('statechange',()=>{ if(nw.state==='installed' && navigator.serviceWorker.controller) showUpdateButton(nw); }); });
    navigator.serviceWorker.addEventListener('controllerchange', () => window.location.reload());
    setInterval(()=>{ registration.update().catch(()=>{}); }, 300_000);
    setInterval(()=>{ if(registration.waiting && updateBtn && updateBtn.style.display==='none'){ showToast('Nuovo aggiornamento disponibile','info',4000); showUpdateButton(registration.waiting);} }, 10_000);
  }).catch(err => console.error('Errore SW:', err));
}