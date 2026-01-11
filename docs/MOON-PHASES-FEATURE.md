# Moon Phases Feature

**Added:** 2026-01-11  
**Status:** Implemented

## Overview

The app now displays moon phase information for each day (Today, Tomorrow, Day After Tomorrow) with interactive tooltips showing phase name, icon, and illumination percentage.

## Implementation Details

### Data Source

- **API:** Open-Meteo Forecast API
- **Parameter:** `moon_phase` (daily)
- **Format:** Float value 0-1
  - 0.00 = New Moon 🌑
  - 0.25 = First Quarter 🌓
  - 0.50 = Full Moon 🌕
  - 0.75 = Last Quarter 🌗
  - 1.00 = New Moon (cycle repeats)

### Files Modified

1. **js/modules/moon-phases.js** (NEW)
   - Core module with moon phase calculations
   - Functions: `getMoonPhaseIcon`, `getMoonPhaseName`, `getMoonPhasePercentage`, `getMoonPhaseTooltip`, `createMoonPhaseIndicator`

2. **js/modules/constants.js**
   - Added `moonId` field to `DAY_CONFIGS` array

3. **js/modules/ui.js**
   - Imported moon-phases module
   - Added `createMoonPhaseIndicator()` function
   - Integrated moon phase rendering in `displayData()`

4. **data.json**
   - Added `moon_phase` field to `daily_units` and `daily` arrays

5. **service-worker.js**
   - Updated cache version to v39
   - Added `./js/modules/moon-phases.js` to cached assets

6. **.github/workflows/build.yml**
   - Updated API call to include `moon_phase` in daily parameters

7. **docs/RFC-001-piove-a-zagarolo-requirements.md**
   - Updated [DATA-003] to include `moon_phase`
   - Updated [FR-002] to mention moon phase indicator
   - Added [API-008] for moon-phases module interface
   - Updated DAY_CONFIGS to include `moonId`

### UI Integration

- **Position:** Moon icon appears in the `.rain-icon` container, **before** the air quality indicator
- **Visual:** Moon phase emoji (🌑-🌘) sized at 1.2rem
- **Tooltip:** Bootstrap tooltip with:
  - Large moon icon (2rem)
  - Phase name in Italian
  - Illumination percentage

### Phase Mappings

| Phase Value | Range      | Name (IT)           | Icon |
|-------------|------------|---------------------|------|
| 0.00        | 0.00-0.03  | Luna Nuova          | 🌑   |
| 0.12        | 0.03-0.22  | Luna Crescente      | 🌒   |
| 0.25        | 0.22-0.28  | Primo Quarto        | 🌓   |
| 0.37        | 0.28-0.47  | Gibbosa Crescente   | 🌔   |
| 0.50        | 0.47-0.53  | Luna Piena          | 🌕   |
| 0.62        | 0.53-0.72  | Gibbosa Calante     | 🌖   |
| 0.75        | 0.72-0.78  | Ultimo Quarto       | 🌗   |
| 0.87        | 0.78-0.97  | Luna Calante        | 🌘   |
| 1.00        | 0.97-1.00  | Luna Nuova          | 🌑   |

## Testing

To test the feature:

1. Start local server: `python -m http.server 8080`
2. Open `http://localhost:8080`
3. Verify moon icons appear in all three day cards
4. Hover/click icons to see tooltips with phase details
5. Check that icons appear before (left of) air quality indicators

## Future Enhancements

Potential improvements:

- Add moon phase chart mode showing lunar cycle visualization
- Display moonrise/moonset times if added to API
- Show moon phase in chart plugins (e.g., as background markers)
- Add lunar calendar view showing full month phases

## API Reference

### Open-Meteo API Call

```bash
curl 'https://api.open-meteo.com/v1/forecast?\
  latitude=41.837610&\
  longitude=12.831867&\
  daily=moon_phase&\
  timezone=auto&\
  forecast_days=3'
```

### Response Format

```json
{
  "daily": {
    "time": ["2026-01-11", "2026-01-12", "2026-01-13"],
    "moon_phase": [0.42, 0.46, 0.50]
  }
}
```

## Notes

- Moon phase values are provided by Open-Meteo and calculated based on astronomical algorithms
- The feature gracefully handles missing data (no icon shown if `moon_phase` is undefined)
- Tooltips use Bootstrap's native tooltip component for consistency
- Icons are positioned dynamically to work with or without air quality data
