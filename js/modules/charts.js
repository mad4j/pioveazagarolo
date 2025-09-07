import { DAY_CONFIGS } from './constants.js';

export const chartInstances = {};

export function getDaySlice(array, dayIndex) { const start = dayIndex * 24; return array.slice(start, start + 24); }

// Plugin linea ora corrente
export const currentHourLinePlugin = { id:'currentHourLine', afterDraw(chart, args, opts) {
  if (chart.config?.data?.labels?.length !== 24) return; if (!opts) return;
  if (typeof opts._cachedHour !== 'number') {
    try { opts._cachedHour = parseInt(new Intl.DateTimeFormat('en-GB',{hour:'numeric',hour12:false,timeZone:'Europe/Rome'}).format(new Date()),10); if (Number.isNaN(opts._cachedHour)) opts._cachedHour = new Date().getHours(); }
    catch { opts._cachedHour = new Date().getHours(); }
  }
  const hour = opts._cachedHour;
  const xScale = chart.scales.x; if (!xScale) return;
  const x = xScale.getPixelForValue(hour);
  const { top, bottom, left } = chart.chartArea;
  const ctx = chart.ctx; ctx.save();
  try { if (x > left) { ctx.fillStyle = opts.overlayColor || 'rgba(120,120,120,0.15)'; ctx.fillRect(left, top, x-left, bottom-top); } } catch {}
  ctx.strokeStyle = opts.color || '#27ae60'; ctx.lineWidth = 1; ctx.setLineDash([4,4]); ctx.beginPath(); ctx.moveTo(x,top); ctx.lineTo(x,bottom); ctx.stroke(); ctx.restore();
} };

// Plugin icone alba/tramonto
export const sunriseSunsetPlugin = { id:'sunriseSunset', afterDraw(chart, a, opts) {
  if (!opts || !opts.sunrise || !opts.sunset) return;
  const xScale = chart.scales.x; if (!xScale) return;
  const { ctx, chartArea } = chart; ctx.save();
  const sr = timeStringToHours(opts.sunrise); const ss = timeStringToHours(opts.sunset);
  if (sr !== null) drawSunIcon(ctx, xScale, chartArea, sr, 'sunrise');
  if (ss !== null) drawSunIcon(ctx, xScale, chartArea, ss, 'sunset');
  ctx.restore();
} };

// Plugin frecce direzione vento
export const windDirectionPlugin = { id:'windDirection', afterDraw(chart, a, opts) {
  if (!opts || !opts.windDirections) return;
  const xScale = chart.scales.x; if (!xScale) return;
  const { ctx, chartArea } = chart; ctx.save();
  opts.windDirections.forEach((direction, index) => {
    if (typeof direction === 'number') {
      drawWindArrow(ctx, xScale, chartArea, index, direction);
    }
  });
  ctx.restore();
} };

function timeStringToHours(str){ try{ const t=str.split('T')[1]; if(!t)return null; const [h,m]=t.split(':').map(Number); return h+m/60;}catch{return null;} }
function formatTime(str){ try{ const t=str.split('T')[1]; return t? t.substring(0,5):str;}catch{return str;} }
function formatDaylightHours(decimalHours){ 
  try{
    const hours = Math.floor(decimalHours);
    const minutes = Math.round((decimalHours - hours) * 60);
    return minutes === 0 ? `${hours}h` : `${hours}h${minutes}m`;
  }catch{
    return `${decimalHours.toFixed(1)}h`;
  }
}
function drawSunIcon(ctx,xScale,area,h,type){
  const x=xScale.getPixelForValue(h);
  if(x<area.left||x>area.right)return;
  // Real glyph characters (not double-escaped) so canvas renders icon instead of literal code
  const glyph = type==='sunrise' ? '\uf051' : '\uf052';
  ctx.save();
  // Font-face dichiara font-family: 'weathericons' (minuscolo). Riduciamo dimensione.
  ctx.font='16px weathericons';
  ctx.textAlign='center';
  ctx.textBaseline='middle';
  ctx.fillStyle= type==='sunrise'? '#dd8f11ff':'#ff3b30';
  // Posizioniamo più in basso (sovrapposto alla linea dell'asse X)
  const y = area.bottom +2; //  +/- sposta leggermente
  try { ctx.fillText(glyph, x, y); }
  catch { // Fallback: small triangle if font not ready
    ctx.beginPath();
    if(type==='sunrise'){ctx.moveTo(x,y+4);ctx.lineTo(x-5,y+10);ctx.lineTo(x+5,y+10);} else {ctx.moveTo(x,y+10);ctx.lineTo(x-5,y+4);ctx.lineTo(x+5,y+4);} ctx.closePath(); ctx.fill();
  }
  ctx.restore();
}

function drawWindArrow(ctx, xScale, area, hourIndex, direction) {
  const x = xScale.getPixelForValue(hourIndex);
  if (x < area.left || x > area.right) return;
  
  const y = area.top + area.height * 0.15; // Position arrows in upper portion of chart
  const arrowLength = 12;
  const arrowHeadSize = 4;
  
  ctx.save();
  ctx.strokeStyle = '#2c3e50';
  ctx.fillStyle = '#2c3e50';
  ctx.lineWidth = 1.5;
  
  // Convert wind direction to radians (direction is where wind comes FROM)
  // Subtract 90 degrees to align with north being up
  const angle = ((direction - 90) * Math.PI) / 180;
  
  // Calculate arrow start and end points, centered around rotation point
  const halfLength = arrowLength / 2;
  const startX = x - Math.cos(angle) * halfLength;
  const startY = y - Math.sin(angle) * halfLength;
  const endX = x + Math.cos(angle) * halfLength;
  const endY = y + Math.sin(angle) * halfLength;
  
  // Draw arrow shaft
  ctx.beginPath();
  ctx.moveTo(startX, startY);
  ctx.lineTo(endX, endY);
  ctx.stroke();
  
  // Draw arrowhead
  const headAngle1 = angle - 0.5;
  const headAngle2 = angle + 0.5;
  
  ctx.beginPath();
  ctx.moveTo(endX, endY);
  ctx.lineTo(endX - Math.cos(headAngle1) * arrowHeadSize, endY - Math.sin(headAngle1) * arrowHeadSize);
  ctx.moveTo(endX, endY);
  ctx.lineTo(endX - Math.cos(headAngle2) * arrowHeadSize, endY - Math.sin(headAngle2) * arrowHeadSize);
  ctx.stroke();
  
  ctx.restore();
}

export function getPrecipitationBarColor(v){ if(v>30)return'#6c3483'; if(v>10)return'#b03a2e'; if(v>6)return'#e74c3c'; if(v>4)return'#f39c12'; if(v>2)return'#27ae60'; if(v>1)return'#3498db'; return'#85c1e9'; }

export function getTemperatureLineColor(v){ if(v>30)return'#e74c3c'; if(v>25)return'#f39c12'; if(v>20)return'#f1c40f'; if(v>15)return'#27ae60'; if(v>10)return'#3498db'; if(v>5)return'#2980b9'; return'#34495e'; }

export function getWindSpeedColor(v){ if(v>50)return'#8e44ad'; if(v>30)return'#e74c3c'; if(v>20)return'#f39c12'; if(v>10)return'#27ae60'; if(v>5)return'#3498db'; return'#85c1e9'; }

function isTouchDevice(){ return 'ontouchstart' in window||navigator.maxTouchPoints>0||navigator.msMaxTouchPoints>0; }

export function buildChart(target, probabilityData, precipitationData, sunriseTime=null, sunsetTime=null){
  const el=document.getElementById(target); if(!el)return; if(chartInstances[target]) chartInstances[target].destroy();
  const precipColors=precipitationData.map(getPrecipitationBarColor); const m=Math.max(...precipitationData,1); const maxPrecip=m<2?2:Math.ceil(m);
  const plugins=[sunriseSunsetPlugin]; if(target==='today-chart') plugins.push(currentHourLinePlugin);
  chartInstances[target]=new Chart(el,{ plugins, data:{ labels:[...Array(24).keys()].map(h=>`${h}:00`.padStart(5,'0')), datasets:[ {label:'Probabilità (%)',type:'line',fill:true,tension:0.4,backgroundColor:'rgba(52,152,219,0.30)',borderColor:'rgb(41,128,185)',borderWidth:2,data:probabilityData,pointBackgroundColor:'rgb(41,128,185)',pointRadius:0,pointHoverRadius:4,yAxisID:'y'}, {label:'Precipitazione (mm/h)',type:'bar',backgroundColor:precipColors,borderColor:precipColors,borderWidth:1,data:precipitationData,yAxisID:'y1',order:2} ]}, options:{ responsive:true, maintainAspectRatio:false, layout:{padding:2}, onHover:(e,a,chart)=>{ if(isTouchDevice()&&a.length){ if(chart._tooltipTimeout) clearTimeout(chart._tooltipTimeout); chart._tooltipTimeout=setTimeout(()=>{chart.tooltip.setActiveElements([],{x:0,y:0}); chart.setActiveElements([]); chart.update('none');},3000);} }, scales:{ y:{min:0,max:100,position:'left',grid:{drawOnChartArea:true,color:'rgba(200,200,200,0.2)',drawTicks:false},ticks:{display:false}}, y1:{min:0,max:maxPrecip,position:'right',grid:{drawOnChartArea:false,drawTicks:false},ticks:{display:false}}, x:{grid:{display:false},ticks:{maxRotation:0,minRotation:0,autoSkip:true,maxTicksLimit:6,color:'#7f8c8d'}} }, plugins:{ currentHourLine:{color:'#27ae60',overlayColor:'rgba(128,128,128,0.18)'}, sunriseSunset:{sunrise:sunriseTime,sunset:sunsetTime}, legend:{display:false}, tooltip:{ enabled:false, external:({chart,tooltip})=>{ let tip=document.getElementById('chartjs-tooltip-'+target); if(!tip){ tip=document.createElement('div'); tip.id='chartjs-tooltip-'+target; Object.assign(tip.style,{position:'absolute',pointerEvents:'none',transition:'all .08s ease',zIndex:30}); document.body.appendChild(tip);} if(!tooltip||tooltip.opacity===0){ tip.style.opacity=0; return; } const rows=[]; if(tooltip.dataPoints?.length){ const dp=tooltip.dataPoints[0]; const idx=dp.dataIndex; const prob=Math.round(dp.parsed.y); const ds2=chart.data.datasets[1]; let mm=0; if(ds2&&ds2.data&&ds2.data[idx]!=null) mm=ds2.data[idx]; const precipStr= mm<1 && mm>0 ? mm.toFixed(1):Math.round(mm); rows.push({k:'rain',t:`Pioggia: ${precipStr}mm (${prob}%)`}); if(sunriseTime&&sunsetTime){ const hour=parseFloat(dp.label.split(':')[0]); const sr=timeStringToHours(sunriseTime); const ss=timeStringToHours(sunsetTime); if(sr&&ss){ const daylight=ss-sr; if(Math.abs(hour-sr)<1) rows.push({k:'sunrise',t:`Alba: ${formatTime(sunriseTime)} (${formatDaylightHours(daylight)} di luce)`}); else if(Math.abs(hour-ss)<1) rows.push({k:'sunset',t:`Tramonto: ${formatTime(sunsetTime)} (${formatDaylightHours(daylight)} di luce)`}); } } } const title=tooltip.title?.[0]?`Ore ${tooltip.title[0]}`:''; let html=`<div style=\"font:12px 'Helvetica Neue',Arial; color:#ecf0f1; background:rgba(44,62,80,0.92); padding:6px 8px; border-radius:6px; box-shadow:0 2px 4px rgba(0,0,0,.35); max-width:240px;\">`; if(title) html+=`<div style=\\"font-weight:600; margin-bottom:4px;\\">${title}</div>`; html+='<div style=\"display:flex; flex-direction:column; gap:2px;\">'; rows.forEach(r=>{ let icon=''; if(r.k==='rain') icon='<i class=\"wi wi-umbrella\" style=\"margin-right:4px; color:#3498db;\"></i>'; else if(r.k==='sunrise') icon='<i class=\"wi wi-sunrise\" style=\"margin-right:4px; color:#f39c12;\"></i>'; else if(r.k==='sunset') icon='<i class=\"wi wi-sunset\" style=\"margin-right:4px; color:#ff3b30;\"></i>'; html+=`<div style=\\"display:flex; align-items:center; font-size:12px; line-height:1.2;\\">${icon}<span>${r.t}</span></div>`; }); html+='</div></div>'; tip.innerHTML=html; const rect=chart.canvas.getBoundingClientRect(); const bodyRect=document.body.getBoundingClientRect(); const left=rect.left + window.pageXOffset + tooltip.caretX + 10; const top=rect.top + window.pageYOffset + tooltip.caretY - 10; tip.style.left=Math.min(left, bodyRect.width-260)+'px'; tip.style.top=top+'px'; tip.style.opacity=1; } } }, interaction:{mode:'index',intersect:false} } });
  // Force redraw once fonts are ready (prevents seeing raw unicode if font loads late)
  if(document.fonts && document.fonts.ready){
    document.fonts.ready.then(()=>{ try{ chartInstances[target].update(); }catch{} });
  }
}

export function buildTemperatureChart(target, temperatureData, apparentTemperatureData, sunriseTime=null, sunsetTime=null){
  const el=document.getElementById(target); if(!el)return; if(chartInstances[target]) chartInstances[target].destroy();
  const tempColors=temperatureData.map(getTemperatureLineColor); 
  const minTemp = Math.min(...temperatureData, ...apparentTemperatureData) - 2;
  const maxTemp = Math.max(...temperatureData, ...apparentTemperatureData) + 2;
  const plugins=[sunriseSunsetPlugin]; if(target==='today-chart') plugins.push(currentHourLinePlugin);
  chartInstances[target]=new Chart(el,{ plugins, data:{ labels:[...Array(24).keys()].map(h=>`${h}:00`.padStart(5,'0')), datasets:[ {label:'Temperatura (°C)',type:'line',fill:false,tension:0.4,backgroundColor:'rgb(231,76,60)',borderColor:'rgb(231,76,60)',borderWidth:2,data:temperatureData,pointBackgroundColor:tempColors,pointRadius:0,pointHoverRadius:4,yAxisID:'y'}, {label:'Temperatura percepita (°C)',type:'line',fill:false,tension:0.4,backgroundColor:'rgba(243,156,18,0.7)',borderColor:'rgb(243,156,18)',borderWidth:1,borderDash:[5,5],data:apparentTemperatureData,pointBackgroundColor:'rgb(243,156,18)',pointRadius:0,pointHoverRadius:4,yAxisID:'y'} ]}, options:{ responsive:true, maintainAspectRatio:false, layout:{padding:2}, onHover:(e,a,chart)=>{ if(isTouchDevice()&&a.length){ if(chart._tooltipTimeout) clearTimeout(chart._tooltipTimeout); chart._tooltipTimeout=setTimeout(()=>{chart.tooltip.setActiveElements([],{x:0,y:0}); chart.setActiveElements([]); chart.update('none');},3000);} }, scales:{ y:{min:minTemp,max:maxTemp,position:'left',grid:{drawOnChartArea:true,color:'rgba(200,200,200,0.2)',drawTicks:false},ticks:{display:false}}, x:{grid:{display:false},ticks:{maxRotation:0,minRotation:0,autoSkip:true,maxTicksLimit:6,color:'#7f8c8d'}} }, plugins:{ currentHourLine:{color:'#27ae60',overlayColor:'rgba(128,128,128,0.18)'}, sunriseSunset:{sunrise:sunriseTime,sunset:sunsetTime}, legend:{display:false}, tooltip:{ enabled:false, external:({chart,tooltip})=>{ let tip=document.getElementById('chartjs-tooltip-'+target); if(!tip){ tip=document.createElement('div'); tip.id='chartjs-tooltip-'+target; Object.assign(tip.style,{position:'absolute',pointerEvents:'none',transition:'all .08s ease',zIndex:30}); document.body.appendChild(tip);} if(!tooltip||tooltip.opacity===0){ tip.style.opacity=0; return; } const rows=[]; if(tooltip.dataPoints?.length){ const dp=tooltip.dataPoints[0]; const idx=dp.dataIndex; const temp=Math.round(dp.parsed.y); const ds2=chart.data.datasets[1]; let apparent=temp; if(ds2&&ds2.data&&ds2.data[idx]!=null) apparent=Math.round(ds2.data[idx]); rows.push({k:'temp',t:`Temperatura: ${temp}°C`}); if(Math.abs(temp-apparent)>1) rows.push({k:'apparent',t:`Percepita: ${apparent}°C`}); if(sunriseTime&&sunsetTime){ const hour=parseFloat(dp.label.split(':')[0]); const sr=timeStringToHours(sunriseTime); const ss=timeStringToHours(sunsetTime); if(sr&&ss){ const daylight=ss-sr; if(Math.abs(hour-sr)<1) rows.push({k:'sunrise',t:`Alba: ${formatTime(sunriseTime)} (${formatDaylightHours(daylight)} di luce)`}); else if(Math.abs(hour-ss)<1) rows.push({k:'sunset',t:`Tramonto: ${formatTime(sunsetTime)} (${formatDaylightHours(daylight)} di luce)`}); } } } const title=tooltip.title?.[0]?`Ore ${tooltip.title[0]}`:''; let html=`<div style=\"font:12px 'Helvetica Neue',Arial; color:#ecf0f1; background:rgba(44,62,80,0.92); padding:6px 8px; border-radius:6px; box-shadow:0 2px 4px rgba(0,0,0,.35); max-width:240px;\">`; if(title) html+=`<div style=\\"font-weight:600; margin-bottom:4px;\\">${title}</div>`; html+='<div style=\"display:flex; flex-direction:column; gap:2px;\">'; rows.forEach(r=>{ let icon=''; if(r.k==='temp') icon='<i class=\"wi wi-thermometer\" style=\"margin-right:4px; color:#e74c3c;\"></i>'; else if(r.k==='apparent') icon='<i class=\"wi wi-thermometer-exterior\" style=\"margin-right:4px; color:#f39c12;\"></i>'; else if(r.k==='sunrise') icon='<i class=\"wi wi-sunrise\" style=\"margin-right:4px; color:#f39c12;\"></i>'; else if(r.k==='sunset') icon='<i class=\"wi wi-sunset\" style=\"margin-right:4px; color:#ff3b30;\"></i>'; html+=`<div style=\\"display:flex; align-items:center; font-size:12px; line-height:1.2;\\">${icon}<span>${r.t}</span></div>`; }); html+='</div></div>'; tip.innerHTML=html; const rect=chart.canvas.getBoundingClientRect(); const bodyRect=document.body.getBoundingClientRect(); const left=rect.left + window.pageXOffset + tooltip.caretX + 10; const top=rect.top + window.pageYOffset + tooltip.caretY - 10; tip.style.left=Math.min(left, bodyRect.width-260)+'px'; tip.style.top=top+'px'; tip.style.opacity=1; } } }, interaction:{mode:'index',intersect:false} } });
  // Force redraw once fonts are ready (prevents seeing raw unicode if font loads late)
  if(document.fonts && document.fonts.ready){
    document.fonts.ready.then(()=>{ try{ chartInstances[target].update(); }catch{} });
  }
}

export function buildWindChart(target, windSpeedData, windDirectionData, sunriseTime=null, sunsetTime=null){
  const el=document.getElementById(target); 
  if(!el) return; 
  if(chartInstances[target]) chartInstances[target].destroy();
  
  const windColors = windSpeedData.map(getWindSpeedColor); 
  const maxSpeed = Math.max(...windSpeedData, 10); // Minimum scale of 10 km/h
  const plugins = [sunriseSunsetPlugin, windDirectionPlugin]; 
  if(target === 'today-chart') plugins.push(currentHourLinePlugin);
  
  chartInstances[target] = new Chart(el, {
    plugins,
    data: {
      labels: [...Array(24).keys()].map(h => `${h}:00`.padStart(5,'0')),
      datasets: [{
        label: 'Velocità vento (km/h)',
        type: 'bar',
        backgroundColor: windColors,
        borderColor: windColors,
        borderWidth: 1,
        data: windSpeedData,
        yAxisID: 'y'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      layout: { padding: 2 },
      onHover: (e, a, chart) => {
        if(isTouchDevice() && a.length) {
          if(chart._tooltipTimeout) clearTimeout(chart._tooltipTimeout);
          chart._tooltipTimeout = setTimeout(() => {
            chart.tooltip.setActiveElements([], {x:0, y:0});
            chart.setActiveElements([]);
            chart.update('none');
          }, 3000);
        }
      },
      scales: {
        y: {
          min: 0,
          max: Math.ceil(maxSpeed * 1.2),
          position: 'left',
          grid: {
            drawOnChartArea: true,
            color: 'rgba(200,200,200,0.2)',
            drawTicks: false
          },
          ticks: { display: false }
        },
        x: {
          grid: { display: false },
          ticks: {
            maxRotation: 0,
            minRotation: 0,
            autoSkip: true,
            maxTicksLimit: 6,
            color: '#7f8c8d'
          }
        }
      },
      plugins: {
        currentHourLine: {
          color: '#27ae60',
          overlayColor: 'rgba(128,128,128,0.18)'
        },
        sunriseSunset: {
          sunrise: sunriseTime,
          sunset: sunsetTime
        },
        windDirection: {
          windDirections: windDirectionData
        },
        legend: { display: false },
        tooltip: {
          enabled: false,
          external: ({chart, tooltip}) => {
            let tip = document.getElementById('chartjs-tooltip-' + target);
            if(!tip) {
              tip = document.createElement('div');
              tip.id = 'chartjs-tooltip-' + target;
              Object.assign(tip.style, {
                position: 'absolute',
                pointerEvents: 'none',
                transition: 'all .08s ease',
                zIndex: 30
              });
              document.body.appendChild(tip);
            }
            
            if(!tooltip || tooltip.opacity === 0) {
              tip.style.opacity = 0;
              return;
            }
            
            const rows = [];
            if(tooltip.dataPoints?.length) {
              const dp = tooltip.dataPoints[0];
              const idx = dp.dataIndex;
              const speed = Math.round(dp.parsed.y);
              const direction = windDirectionData[idx];
              
              rows.push({k:'wind', t:`Vento: ${speed} km/h`});
              
              if(typeof direction === 'number') {
                const directionText = getWindDirectionText(direction);
                rows.push({k:'direction', t:`Direzione: ${directionText} (${Math.round(direction)}°)`});
              }
              
              if(sunriseTime && sunsetTime) {
                const hour = parseFloat(dp.label.split(':')[0]);
                const sr = timeStringToHours(sunriseTime);
                const ss = timeStringToHours(sunsetTime);
                if(sr && ss) {
                  const daylight = ss - sr;
                  if(Math.abs(hour - sr) < 1) {
                    rows.push({k:'sunrise', t:`Alba: ${formatTime(sunriseTime)} (${formatDaylightHours(daylight)} di luce)`});
                  } else if(Math.abs(hour - ss) < 1) {
                    rows.push({k:'sunset', t:`Tramonto: ${formatTime(sunsetTime)} (${formatDaylightHours(daylight)} di luce)`});
                  }
                }
              }
            }
            
            const title = tooltip.title?.[0] ? `Ore ${tooltip.title[0]}` : '';
            let html = `<div style="font:12px 'Helvetica Neue',Arial; color:#ecf0f1; background:rgba(44,62,80,0.92); padding:6px 8px; border-radius:6px; box-shadow:0 2px 4px rgba(0,0,0,.35); max-width:240px;">`;
            
            if(title) {
              html += `<div style="font-weight:600; margin-bottom:4px;">${title}</div>`;
            }
            
            html += '<div style="display:flex; flex-direction:column; gap:2px;">';
            rows.forEach(r => {
              let icon = '';
              if(r.k === 'wind') icon = '<i class="wi wi-strong-wind" style="margin-right:4px; color:#3498db;"></i>';
              else if(r.k === 'direction') icon = '<span style="margin-right:4px; color:#2c3e50; font-family: Arial, sans-serif;">↗</span>';
              else if(r.k === 'sunrise') icon = '<i class="wi wi-sunrise" style="margin-right:4px; color:#f39c12;"></i>';
              else if(r.k === 'sunset') icon = '<i class="wi wi-sunset" style="margin-right:4px; color:#ff3b30;"></i>';
              
              html += `<div style="display:flex; align-items:center; font-size:12px; line-height:1.2;">${icon}<span>${r.t}</span></div>`;
            });
            html += '</div></div>';
            
            tip.innerHTML = html;
            
            const rect = chart.canvas.getBoundingClientRect();
            const bodyRect = document.body.getBoundingClientRect();
            const left = rect.left + window.pageXOffset + tooltip.caretX + 10;
            const top = rect.top + window.pageYOffset + tooltip.caretY - 10;
            
            tip.style.left = Math.min(left, bodyRect.width - 260) + 'px';
            tip.style.top = top + 'px';
            tip.style.opacity = 1;
          }
        }
      },
      interaction: {
        mode: 'index',
        intersect: false
      }
    }
  });
  
  // Force redraw once fonts are ready (prevents seeing raw unicode if font loads late)
  if(document.fonts && document.fonts.ready) {
    document.fonts.ready.then(() => {
      try {
        chartInstances[target].update();
      } catch(e) {}
    });
  }
}

function getWindDirectionText(degrees) {
  const directions = [
    'N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE',
    'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'
  ];
  const index = Math.round((degrees % 360) / 22.5) % 16;
  return directions[index];
}
