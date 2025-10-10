# RFC-002: Analisi API Open-Meteo e Suggerimenti per Nuove Visualizzazioni

**Status:** Proposta

**Last-Updated:** 2025-10-09

**Authors:** Copilot Analysis

## Abstract

Questo documento analizza le capacità dell'API Open-Meteo attualmente utilizzate e non utilizzate, e propone nuove visualizzazioni interessanti per arricchire l'applicazione "Piove a Zagarolo". L'analisi si basa sui dati già disponibili e su potenziali espansioni dell'API.

## 1. Analisi Dati Attualmente Disponibili

### 1.1 Dati Meteorologici (Weather API)

**Dati Orari Attualmente Utilizzati:**
- ✅ `precipitation` (mm/h) - usato in modalità precipitazioni
- ✅ `precipitation_probability` (%) - usato in modalità precipitazioni
- ✅ `temperature_2m` (°C) - usato in modalità temperatura
- ✅ `apparent_temperature` (°C) - usato in modalità temperatura
- ✅ `wind_speed_10m` (km/h) - usato in modalità vento
- ✅ `wind_direction_10m` (°) - usato in modalità vento
- ✅ `pressure_msl` (hPa) - usato in modalità pressione
- ✅ `relative_humidity_2m` (%) - opzionale in modalità temperatura
- ✅ `weather_code` (WMO) - usato per icone
- ✅ `is_day` (0/1) - usato per icone
- ⚠️ `cloud_cover` (%) - parzialmente usato (icone ogni 3h)
- ⚠️ `uv_index` - usato solo in modalità qualità dell'aria
- ✅ `showers` (mm) - usato per avvisi
- ✅ `snowfall` (cm) - usato per avvisi

**Dati Giornalieri Utilizzati:**
- ✅ `sunrise`, `sunset` - usati nei grafici
- ✅ `temperature_2m_max`, `temperature_2m_min` - usati nelle card
- ✅ `weather_code` - usato per icone giornaliere
- ✅ `precipitation_sum` (mm) - usato nelle card
- ✅ `precipitation_probability_max` (%) - usato nelle card

**Dati Correnti Utilizzati:**
- ✅ `temperature_2m`, `apparent_temperature`, `rain`, `precipitation`
- ✅ `pressure_msl`, `relative_humidity_2m`, `wind_speed_10m`, `wind_direction_10m`
- ✅ `weather_code`, `is_day`

### 1.2 Dati Qualità dell'Aria (Air Quality API)

**Attualmente Utilizzati:**
- ✅ `european_aqi` (EAQI) - visualizzato in modalità air-quality

### 1.3 Dati Potenzialmente Disponibili da Open-Meteo (Non Ancora Utilizzati)

Secondo la documentazione di Open-Meteo, sono disponibili ulteriori parametri:

**Variabili Meteorologiche Aggiuntive:**
- `visibility` (m) - visibilità atmosferica
- `surface_pressure` (hPa) - pressione superficiale
- `dewpoint_2m` (°C) - punto di rugiada
- `windgusts_10m` (km/h) - raffiche di vento
- `soil_temperature_*` (°C) - temperatura del suolo a varie profondità
- `soil_moisture_*` (m³/m³) - umidità del suolo
- `evapotranspiration` (mm) - evapotraspirazione
- `et0_fao_evapotranspiration` (mm) - evapotraspirazione FAO
- `vapour_pressure_deficit` (kPa) - deficit di pressione del vapore
- `cape` (J/kg) - energia potenziale disponibile per convezione
- `freezinglevel_height` (m) - altezza dello zero termico
- `snow_depth` (m) - profondità della neve

**Variabili Qualità dell'Aria Aggiuntive:**
- `pm10`, `pm2_5` (μg/m³) - particolato
- `carbon_monoxide` (μg/m³) - monossido di carbonio
- `nitrogen_dioxide` (μg/m³) - biossido di azoto
- `sulphur_dioxide` (μg/m³) - biossido di zolfo
- `ozone` (μg/m³) - ozono
- `aerosol_optical_depth` - profondità ottica dell'aerosol
- `dust`, `uv_index`, `uv_index_clear_sky`
- `ammonia`, `alder_pollen`, `birch_pollen`, `grass_pollen`, etc.

## 2. Nuove Visualizzazioni Suggerite

### 2.1 PRIORITÀ ALTA - Miglioramenti con Dati Esistenti

#### 2.1.1 Modalità "Comfort" (Nuova)
**Descrizione:** Visualizzazione combinata del comfort percepito basata su temperatura, umidità e vento.

**Motivazione:** Attualmente la temperatura apparente è mostrata solo come tooltip. Una visualizzazione dedicata al comfort può aiutare gli utenti a capire meglio come si "sente" il tempo.

**Dati Utilizzati:**
- `temperature_2m` (già disponibile)
- `apparent_temperature` (già disponibile)
- `relative_humidity_2m` (già disponibile)
- `wind_speed_10m` (già disponibile)

**Visualizzazione:**
- **Linea principale:** Delta comfort (temperatura apparente - temperatura reale)
- **Area colorata:** Indicatore di comfort (verde = confortevole, giallo = accettabile, arancio = scomodo, rosso = molto scomodo)
- **Bars secondarie:** Umidità relativa
- **Annotazioni:** Zone di comfort/discomfort

**Metriche di Comfort:**
```javascript
// Comfort index basato su temperatura, umidità e vento
function calculateComfortIndex(temp, humidity, windSpeed) {
  let comfort = 100; // Partenza da comfort massimo
  
  // Temperatura ottimale: 18-24°C
  if (temp < 18) comfort -= (18 - temp) * 3;
  if (temp > 24) comfort -= (temp - 24) * 3;
  
  // Umidità ottimale: 30-60%
  if (humidity < 30) comfort -= (30 - humidity) * 0.5;
  if (humidity > 60) comfort -= (humidity - 60) * 0.8;
  
  // Vento: oltre 20 km/h inizia a essere fastidioso
  if (windSpeed > 20) comfort -= (windSpeed - 20) * 1.5;
  
  return Math.max(0, Math.min(100, comfort));
}
```

**Benefici:**
- Utilizza solo dati già disponibili
- Fornisce una visione intuitiva delle condizioni
- Aiuta nella pianificazione di attività all'aperto

---

#### 2.1.2 Modalità "Visibilità e Nebbia" (Nuova)
**Descrizione:** Visualizzazione focalizzata su condizioni di visibilità ridotta, nebbia e foschia.

**Motivazione:** La zona di Zagarolo può avere nebbie mattutine. Una visualizzazione dedicata aiuta a pianificare viaggi e attività.

**Dati Utilizzati:**
- `cloud_cover` (già disponibile, attualmente sottoutilizzato)
- `relative_humidity_2m` (già disponibile)
- `weather_code` (già disponibile - codici 45, 48 indicano nebbia)
- `temperature_2m`, `dewpoint_2m` (se disponibile) per calcolare rischio nebbia

**Visualizzazione:**
- **Bars principale:** Copertura nuvolosa (0-100%)
- **Linea:** Umidità relativa
- **Indicatori speciali:** Icone nebbia quando weather_code = 45/48
- **Zone colorate:** Rischio nebbia alto quando umidità > 90% e copertura nuvolosa bassa

**Calcolo Rischio Nebbia:**
```javascript
function calculateFogRisk(humidity, cloudCover, isNight, temp, dewpoint = null) {
  if (humidity < 85) return 'basso';
  
  // Se abbiamo il dewpoint, calcolo preciso
  if (dewpoint !== null && Math.abs(temp - dewpoint) < 2) {
    return 'alto';
  }
  
  // Altrimenti stima basata su umidità e copertura
  if (humidity > 95 && cloudCover < 50 && isNight) {
    return 'alto';
  } else if (humidity > 90) {
    return 'medio';
  }
  
  return 'basso';
}
```

**Benefici:**
- Evidenzia condizioni di visibilità ridotta
- Utile per automobilisti e motociclisti
- Usa dati già disponibili in modo più efficace

---

#### 2.1.3 Miglioramento Modalità UV (Espansione Air Quality)
**Descrizione:** Potenziare la visualizzazione UV nella modalità qualità dell'aria esistente.

**Motivazione:** L'UV index è già disponibile ma sottoutilizzato. Con l'aumento della consapevolezza sui danni UV, una visualizzazione più ricca è utile.

**Dati Utilizzati:**
- `uv_index` (già disponibile)
- `cloud_cover` (già disponibile)
- `is_day` (già disponibile)

**Visualizzazione Migliorata:**
- **Bars colorati UV:** Scala WHO (0-2 basso verde, 3-5 moderato giallo, 6-7 alto arancio, 8-10 molto alto rosso, 11+ estremo viola)
- **Linea EAQI:** Mantiene la qualità dell'aria esistente
- **Annotazioni cloud cover:** Mostra attenuazione UV per nuvolosità
- **Tooltip arricchito:** Tempo consigliato di esposizione, necessità protezione

**Categorie UV con Consigli:**
```javascript
function getUVAdvice(uvIndex) {
  if (uvIndex < 3) return {
    level: 'Basso',
    color: 'green',
    advice: 'Nessuna protezione necessaria'
  };
  if (uvIndex < 6) return {
    level: 'Moderato',
    color: 'yellow',
    advice: 'Protezione consigliata 10:00-16:00'
  };
  if (uvIndex < 8) return {
    level: 'Alto',
    color: 'orange',
    advice: 'Protezione necessaria. Evitare 11:00-15:00'
  };
  if (uvIndex < 11) return {
    level: 'Molto Alto',
    color: 'red',
    advice: 'Protezione essenziale. Limitare esposizione'
  };
  return {
    level: 'Estremo',
    color: 'purple',
    advice: 'Evitare esposizione solare'
  };
}
```

**Benefici:**
- Aumenta consapevolezza sui rischi UV
- Dati già disponibili, solo UI da migliorare
- Complementare con dati qualità dell'aria

---

### 2.2 PRIORITÀ MEDIA - Visualizzazioni con Nuovi Dati API

#### 2.2.1 Modalità "Precipitazioni Dettagliate" (Espansione)
**Descrizione:** Distinguere tra tipi di precipitazione e mostrare accumuli.

**Nuovi Dati da Richiedere:**
- Già disponibili: `showers`, `snowfall`
- Da aggiungere: `rain`, `freezing_rain` (se disponibili)

**Visualizzazione:**
- **Bars stack:** Precipitazione totale, pioggia, acquazzoni, neve (colori diversi)
- **Linea cumulativa:** Accumulo progressivo della giornata
- **Icone speciali:** Neve, grandine, pioggia gelata

**Benefici:**
- Maggiore dettaglio sui tipi di precipitazione
- Accumuli utili per allerte e pianificazione
- Integrazione con dati actual già disponibili

---

#### 2.2.2 Modalità "Vento Dettagliato" (Espansione)
**Descrizione:** Aggiungere raffiche di vento alla visualizzazione esistente.

**Nuovi Dati da Richiedere:**
- `windgusts_10m` (km/h) - raffiche di vento

**Visualizzazione:**
- **Bars velocità media:** Mantiene visualizzazione attuale
- **Linea tratteggiata raffiche:** Sovrapposizione per mostrare picchi
- **Alert zone:** Evidenziare quando raffiche > 60 km/h (vento forte)
- **Frecce direzione:** Mantiene plugin esistente

**Scala Beaufort con Raffiche:**
```javascript
function getWindDescription(speed, gusts = null) {
  const beaufort = [
    {max: 1, desc: 'Calma', icon: 'calm'},
    {max: 5, desc: 'Bava di vento', icon: 'light'},
    {max: 11, desc: 'Brezza leggera', icon: 'breeze'},
    {max: 19, desc: 'Brezza tesa', icon: 'moderate'},
    {max: 28, desc: 'Vento moderato', icon: 'fresh'},
    {max: 38, desc: 'Vento teso', icon: 'strong'},
    {max: 49, desc: 'Vento fresco', icon: 'gale'},
    {max: 61, desc: 'Vento forte', icon: 'storm'},
    {max: 74, desc: 'Burrasca', icon: 'violent'},
    {max: 88, desc: 'Burrasca forte', icon: 'storm'},
    {max: 102, desc: 'Tempesta', icon: 'hurricane'},
    {max: 117, desc: 'Tempesta violenta', icon: 'hurricane'},
    {max: Infinity, desc: 'Uragano', icon: 'hurricane'}
  ];
  
  const category = beaufort.find(b => speed < b.max);
  const result = { speed, description: category.desc };
  
  if (gusts && gusts > speed * 1.5) {
    result.warning = 'Raffiche significative';
    result.gustCategory = beaufort.find(b => gusts < b.max).desc;
  }
  
  return result;
}
```

**Benefici:**
- Importante per sicurezza (ciclisti, motociclisti, attività all'aperto)
- Allerta per raffiche pericolose
- Una sola richiesta API aggiuntiva

---

#### 2.2.3 Modalità "Punto di Rugiada e Umidità"
**Descrizione:** Visualizzazione dedicata a umidità, punto di rugiada e comfort.

**Nuovi Dati da Richiedere:**
- `dewpoint_2m` (°C) - punto di rugiada

**Visualizzazione:**
- **Linea temperatura:** Temperatura attuale
- **Linea dewpoint:** Punto di rugiada
- **Area differenza:** Zona tra le due linee colorata per indicare condizioni
  - Gap piccolo (< 3°C): alto rischio nebbia/rugiada (blu scuro)
  - Gap medio (3-5°C): condizioni umide (blu chiaro)
  - Gap grande (> 5°C): condizioni secche (grigio)
- **Bars umidità:** Umidità relativa %

**Interpretazione:**
```javascript
function analyzeDewpoint(temp, dewpoint) {
  const spread = temp - dewpoint;
  
  if (spread < 1) return {
    condition: 'Saturazione',
    risk: 'Nebbia imminente o pioggia',
    color: '#1a237e'
  };
  if (spread < 3) return {
    condition: 'Molto Umido',
    risk: 'Probabile nebbia o rugiada',
    color: '#2196f3'
  };
  if (spread < 5) return {
    condition: 'Umido',
    risk: 'Condizioni umide, possibile rugiada',
    color: '#64b5f6'
  };
  if (spread < 10) return {
    condition: 'Moderato',
    risk: 'Condizioni normali',
    color: '#90a4ae'
  };
  return {
    condition: 'Secco',
    risk: 'Aria secca, nessun rischio nebbia',
    color: '#ffa726'
  };
}
```

**Benefici:**
- Utile per agricoltori, giardinieri
- Predizione nebbia più accurata
- Comprensione del comfort percepito

---

### 2.3 PRIORITÀ BASSA - Visualizzazioni Avanzate/Specializzate

#### 2.3.1 Modalità "Cielo" (Sky Conditions)
**Descrizione:** Visualizzazione completa delle condizioni del cielo.

**Dati da Richiedere:**
- Già disponibili: `cloud_cover`, `weather_code`, `is_day`
- Nuovi: `visibility` (m), `sunshine_duration` (se disponibile)

**Visualizzazione:**
- **Area copertura nuvolosa:** 0-100% con gradiente
- **Bars visibilità:** Distanza visibilità (se disponibile)
- **Icone meteo:** Condizioni del cielo ogni ora
- **Indicatori alba/tramonto:** Plugin esistente

**Benefici:**
- Utile per fotografi, astronomi
- Pianificazione osservazioni astronomiche
- Visualizzazione semplice e intuitiva

---

#### 2.3.2 Modalità "Indice di Disagio" (Heat Index / Wind Chill)
**Descrizione:** Calcolo e visualizzazione di indici di disagio termico.

**Dati Utilizzati:**
- `temperature_2m`, `apparent_temperature` (già disponibili)
- `relative_humidity_2m` (già disponibile)
- `wind_speed_10m` (già disponibile)

**Calcolo Heat Index:**
```javascript
function calculateHeatIndex(temp, humidity) {
  // Formula NOAA per temperature > 27°C
  if (temp < 27) return temp;
  
  const T = temp;
  const RH = humidity;
  
  let HI = -8.78469475556 
         + 1.61139411 * T 
         + 2.33854883889 * RH 
         + (-0.14611605) * T * RH 
         + (-0.012308094) * T * T 
         + (-0.0164248277778) * RH * RH 
         + 0.002211732 * T * T * RH 
         + 0.00072546 * T * RH * RH 
         + (-0.000003582) * T * T * RH * RH;
  
  return HI;
}

function calculateWindChill(temp, windSpeed) {
  // Formula per temperature < 10°C e vento > 4.8 km/h
  if (temp > 10 || windSpeed < 4.8) return temp;
  
  const V = windSpeed;
  const T = temp;
  
  return 13.12 + 0.6215 * T - 11.37 * Math.pow(V, 0.16) 
         + 0.3965 * T * Math.pow(V, 0.16);
}
```

**Visualizzazione:**
- **Linea temperatura reale:** Base
- **Linea temperatura percepita:** Heat index o wind chill
- **Area differenza:** Colorata per severità
- **Alert zones:** Quando indici raggiungono livelli pericolosi

**Benefici:**
- Sicurezza in condizioni estreme
- Consapevolezza rischi termici
- Usa solo dati esistenti

---

#### 2.3.3 Estensione Air Quality - Inquinanti Dettagliati
**Descrizione:** Breakdown dettagliato degli inquinanti atmosferici.

**Nuovi Dati da Richiedere:**
- `pm10`, `pm2_5` (μg/m³)
- `nitrogen_dioxide` (μg/m³)
- `sulphur_dioxide` (μg/m³)
- `ozone` (μg/m³)
- `carbon_monoxide` (μg/m³)

**Visualizzazione:**
- **Bars stack:** Contributo di ciascun inquinante all'EAQI
- **Linee individuali:** Trend di PM2.5, PM10, NO2, O3
- **Soglie WHO:** Linee di riferimento per valori limite
- **Tooltip dettagliati:** Fonte inquinante e effetti sulla salute

**Benefici:**
- Consapevolezza su fonti di inquinamento
- Utile per persone con problemi respiratori
- Educazione ambientale

---

## 3. Nuove Funzionalità Cross-Mode

### 3.1 Allerte e Notifiche
**Suggerimento:** Sistema di soglie configurabili per:
- Precipitazioni intense (> 10 mm/h)
- Vento forte (raffiche > 60 km/h)
- UV molto alto (> 8)
- EAQI scarso (> 100)
- Temperatura estrema (< 0°C o > 35°C)

### 3.2 Comparazione Giornaliera
**Suggerimento:** Overlay per confrontare:
- Oggi vs domani (stesso grafico, linee diverse)
- Oggi vs media storica (se dati disponibili)
- Previsione vs actual (per oggi)

### 3.3 Esportazione Dati
**Suggerimento:** Permettere download/export di:
- Screenshot grafico corrente
- Dati CSV per analisi
- Condivisione su social media

---

## 4. Prioritizzazione delle Implementazioni

### Fase 1 - Quick Wins (Solo Dati Esistenti)
1. **Modalità Comfort** - massimo valore, minimo sforzo
2. **Miglioramento UV in Air Quality** - potenzia funzionalità esistente
3. **Modalità Visibilità/Nebbia** - usa dati sottoutilizzati

### Fase 2 - Espansioni API (Dati Aggiuntivi Facili)
1. **Vento con Raffiche** - una variabile aggiuntiva, alto valore
2. **Punto di Rugiada** - una variabile, utile per nebbia
3. **Precipitazioni Dettagliate** - migliora modalità più usata

### Fase 3 - Funzionalità Avanzate
1. **Qualità Aria Dettagliata** - più variabili, pubblico di nicchia
2. **Modalità Cielo** - per utenti specializzati
3. **Sistema Allerte** - richiede backend/notifiche

---

## 5. Considerazioni di Implementazione

### 5.1 Compatibilità
- Tutte le nuove modalità devono rispettare l'architettura esistente
- Plugin Chart.js riutilizzabili (sunrise/sunset, current hour, etc.)
- Stessa UX di navigazione (dots, swipe)

### 5.2 Performance
- Nessun impatto su chiamate API esistenti per Fase 1
- Per Fase 2: valutare se unificare chiamate o separare
- Caching localStorage esistente sufficiente

### 5.3 Accessibilità
- Mantenere ARIA labels consistenti
- Color contrast per nuovi grafici
- Tooltips descrittivi per nuove metriche

### 5.4 Mobile First
- Testare su 375×667 viewport
- Gesture support per nuove modalità
- Touch-friendly tooltips

---

## 6. Raccomandazioni Finali

### Implementazione Suggerita per Issue Corrente

Per rispondere all'issue "Analizzare la API di OpenMeteo e suggerire nuove visualizzazioni interessanti", raccomando di:

1. **Implementare la Modalità Comfort** come proof-of-concept:
   - Usa solo dati esistenti
   - Fornisce valore immediato agli utenti
   - Dimostra la capacità di estensione
   - Codice stimato: ~200 linee (1 nuova funzione builder, 1 plugin)

2. **Documentare le altre proposte** in questo RFC per future iterazioni

3. **Creare issue separate** per le visualizzazioni di Fase 2 e 3

### Metriche di Successo

- ✅ Documento di analisi completo dell'API Open-Meteo
- ✅ Almeno 5 nuove visualizzazioni suggerite e documentate
- ✅ Prioritizzazione chiara con criteri (valore vs sforzo)
- ✅ Considerazioni implementative (performance, a11y, mobile)
- ✅ (Opzionale) Una nuova visualizzazione implementata come demo

---

## 7. Riferimenti

- [Open-Meteo Weather API Documentation](https://open-meteo.com/en/docs)
- [Open-Meteo Air Quality API Documentation](https://open-meteo.com/en/docs/air-quality-api)
- RFC-001: Piove a Zagarolo Requirements and Interfaces
- [WHO UV Index Guidelines](https://www.who.int/news-room/questions-and-answers/item/radiation-the-ultraviolet-(uv)-index)
- [NOAA Heat Index Calculator](https://www.weather.gov/safety/heat-index)
- [Beaufort Wind Scale](https://www.rmets.org/metmatters/beaufort-wind-scale)

---

**Appendice A: Stima Effort per Implementazione**

| Visualizzazione | Nuove API Calls | Nuovo Codice (LOC) | Effort (giorni) | Priorità |
|----------------|-----------------|-------------------|-----------------|----------|
| Modalità Comfort | 0 | ~200 | 1 | Alta |
| Miglioramento UV | 0 | ~100 | 0.5 | Alta |
| Visibilità/Nebbia | 0 | ~180 | 1 | Alta |
| Vento con Raffiche | 1 param | ~120 | 0.5 | Media |
| Punto di Rugiada | 1 param | ~150 | 1 | Media |
| Precipitazioni Dettagliate | 0 (già richiesti) | ~100 | 0.5 | Media |
| Air Quality Dettagliata | 5 params | ~250 | 2 | Bassa |
| Modalità Cielo | 1-2 params | ~180 | 1 | Bassa |
| Sistema Allerte | 0 | ~400 | 3 | Bassa |

**Note:** LOC = Lines of Code (stima approssimativa includendo tests e docs)
