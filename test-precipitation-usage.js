console.log("=== TEST PRECIPITATION DATA ===");
console.log("1. File caricato:", !!window.precipitationManager);
console.log("2. Dati disponibili:", window.precipitationManager?.actualData);
console.log("3. Data valida:", window.precipitationManager?.isDataValid());

// Verifica se le funzioni di blend sono commentate in ui.js
fetch('js/modules/ui.js').then(r => r.text()).then(code => {
  const hasBlendCalls = code.includes('blendTodayPrecipitation(') && !code.match(/\/\/.*blendTodayPrecipitation/);
  console.log("4. Blend attivo in ui.js:", hasBlendCalls);
  console.log("\n❌ RISULTATO: Il file data-precipitations.json viene CARICATO ma NON viene USATO");
  console.log("   Le funzioni di blending sono commentate in ui.js (linee 375-400)");
  console.log("   Motivo: Verificare problema del 2025-08-21 (aquazzone perso)");
});
