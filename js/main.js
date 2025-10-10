// Entry point modulare principale
import { displayData, showToast } from './modules/ui.js';
import { loadCachedData, saveCachedData } from './modules/cache.js';
import { precipitationManager } from './modules/precipitation.js';
import './modules/debug-mobile.js';

let _fetchInFlight = false;
let _retryTimer = null;

async function retrieveData() {
  try {
    if (_fetchInFlight) return; // avoid concurrent fetches from timers/online events
    _fetchInFlight = true;
    const randomQuery = `?nocache=${Math.floor(Date.now() / (60 * 1000))}`;
    const response = await fetch(`data.json${randomQuery}`);
    if (!response.ok) throw new Error('Errore nel caricamento dei dati meteo');
    const data = await response.json();
    
    // Load actual precipitation data
    await precipitationManager.loadActualData();
    
    displayData(data);
    saveCachedData(data);
    _fetchInFlight = false;
  } catch (e) {
    console.error('Errore:', e);
    const cached = loadCachedData();
    if (cached) {
      // Try to load precipitation data even from cache
      try { await precipitationManager.loadActualData(); } catch {}
      displayData(cached.data);
    } else {
      showToast('Errore rete. Ritento fra 60 secondi...', 'error');
    }
    _fetchInFlight = false;
    if (_retryTimer) { clearTimeout(_retryTimer); _retryTimer = null; }
    // Add small jitter to avoid thundering herd and align with minute cache-buster
    const jitter = Math.floor(Math.random() * 3000);
    _retryTimer = setTimeout(() => { _retryTimer = null; retrieveData(); }, 60_000 + jitter);
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
  setInterval(() => { retrieveData(); }, 30 * 60 * 1000);

  // Fallback: prevent accidental text selection when clicking/tapping weather cards
  try {
    const disableSelection = (e) => e.preventDefault();
    const cards = document.querySelectorAll('.forecast-card, .current-conditions-card');
    cards.forEach(card => {
      // Modern browsers support 'user-select: none' via CSS; prevent selectionstart as extra safety
      card.addEventListener('selectstart', disableSelection);
      // Prevent selection on mousedown but allow touch gestures for pull-to-refresh
      card.addEventListener('mousedown', (ev) => ev.preventDefault());
      // Note: Removed touchstart preventDefault to allow pull-to-refresh gesture
      // CSS user-select: none is sufficient for preventing text selection on modern touch devices
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