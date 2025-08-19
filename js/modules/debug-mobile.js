// Debug mobile estratto
import { $ } from './constants.js';

(function(){
 console.log('🔍 DEBUG MOBILE - Script caricato');
 window.debugLogs = [];
 window._debugActivated = false;
 function createDebugPanel(){
  const existing = document.getElementById('mobile-debug-panel'); if (existing) existing.remove();
  if (!document.getElementById('debug-panel-styles')) {
    const style = document.createElement('style');
    style.id='debug-panel-styles';
    style.textContent = `.debug-btns-wrap{position:fixed;top:10px;right:10px;z-index:10000;display:flex;gap:6px}.debug-btn{width:38px;height:38px;display:inline-flex;align-items:center;justify-content:center;border-radius:8px;border:1px solid #334155;background:#1e293b;color:#e2e8f0;cursor:pointer;padding:0;transition:background .2s,transform .15s;box-shadow:0 2px 4px rgba(0,0,0,.25)}.debug-btn:hover{background:#334155}.debug-btn:active{transform:translateY(1px)}.debug-btn svg{width:20px;height:20px;stroke:currentColor}.debug-btn.debug-toggle-active{background:#0d9488;border-color:#0f766e}#mobile-debug-panel{backdrop-filter:blur(6px)}@media (prefers-color-scheme: light){.debug-btn{background:#f1f5f9;color:#334155;border-color:#cbd5e1}.debug-btn:hover{background:#e2e8f0}.debug-btn.debug-toggle-active{background:#14b8a6;color:#ffffff;border-color:#0d9488}}`;
    document.head.appendChild(style);
  }
  const panel = document.createElement('div'); panel.id='mobile-debug-panel'; panel.style.cssText='position:fixed;top:58px;left:10px;right:10px;background:rgba(15,23,42,0.92);color:#a5f3fc;font-family:Courier New,monospace;font-size:11px;padding:12px 12px 16px;border-radius:10px;z-index:9999;max-height:250px;overflow-y:auto;white-space:pre-wrap;display:none;border:1px solid #334155;box-shadow:0 4px 16px rgba(0,0,0,.4)';
  const controls=document.createElement('div');controls.className='debug-btns-wrap';
  const mkBtn=(label,svg,aria)=>{const b=document.createElement('button');b.className='debug-btn';b.type='button';b.setAttribute('aria-label',aria);b.innerHTML=svg;return b;};
  const toggleBtn=mkBtn('toggle',`<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8Z" /><circle cx="12" cy="12" r="3" /></svg>`,`Mostra/Nascondi log debug`);
  const copyBtn=mkBtn('copy',`<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4c0-1.1.9-2 2-2h9a2 2 0 0 1 2 2v1" /></svg>`,`Copia log`);
  const clearBtn=mkBtn('clear',`<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18" /><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /><path d="M10 11v6" /><path d="M14 11v6" /><path d="M5 6l1 14a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2l1-14" /></svg>`,`Svuota log`);
  controls.append(toggleBtn,copyBtn,clearBtn); document.body.append(panel,controls);
  toggleBtn.addEventListener('click',()=>{const show=panel.style.display==='none';panel.style.display=show?'block':'none';toggleBtn.classList.toggle('debug-toggle-active',show);});
  copyBtn.addEventListener('click',()=>{const restore=copyBtn.innerHTML;const ok=()=>{copyBtn.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m20 6-11 11-5-5"/></svg>';setTimeout(()=>copyBtn.innerHTML=restore,1200);};navigator.clipboard.writeText(panel.textContent).then(ok).catch(()=>{const ta=document.createElement('textarea');ta.value=panel.textContent;document.body.appendChild(ta);ta.select();document.execCommand('copy');document.body.removeChild(ta);ok();});});
  clearBtn.addEventListener('click',()=>{panel.textContent='';window.debugLogs=[];});
  return panel;
 }
 function mobileLog(message,data={}){ if(!window._debugActivated) return; const timestamp=new Date().toLocaleTimeString(); const entry=`[${timestamp}] ${message}\n${JSON.stringify(data,null,2)}\n---\n`; console.log(message,data); window.debugLogs.push({timestamp,message,data}); const panel=document.getElementById('mobile-debug-panel'); if(panel){ panel.textContent+=entry; panel.scrollTop=panel.scrollHeight; } }
 function gatherViewportInfo(event='unknown'){ if(!window._debugActivated) return; const info={ evento:event, timestamp:new Date().toLocaleTimeString(), windowInner:`${window.innerWidth}x${window.innerHeight}`, windowOuter:`${window.outerWidth}x${window.outerHeight}`, screen:`${screen.width}x${screen.height}`, docClient:document.documentElement?`${document.documentElement.clientWidth}x${document.documentElement.clientHeight}`:'N/A', bodyClient:document.body?`${document.body.clientWidth}x${document.body.clientHeight}`:'N/A', bodyScroll:document.body?`${document.body.scrollWidth}x${document.body.scrollHeight}`:'N/A', visualViewport:window.visualViewport?`${window.visualViewport.width}x${window.visualViewport.height}`:'N/A', dashboardHeight:(()=>{const el=document.querySelector('.dashboard-container');return el?el.offsetHeight:'N/A';})(), footerInfo:(()=>{const footer=document.querySelector('footer'); if(!footer) return 'Footer non trovato'; const rect=footer.getBoundingClientRect(); return { visible: rect.bottom <= window.innerHeight && rect.top >= 0, position:`top:${Math.round(rect.top)} bottom:${Math.round(rect.bottom)}`, windowHeight: window.innerHeight };})(), scroll:`x:${window.scrollX} y:${window.scrollY}`, isMobile: navigator.userAgent.includes('Mobile'), safeAreas:(()=>{ if(CSS && CSS.supports && CSS.supports('top: env(safe-area-inset-top)')){ const s=getComputedStyle(document.documentElement); return { top:s.getPropertyValue('env(safe-area-inset-top)')||'0px', bottom:s.getPropertyValue('env(safe-area-inset-bottom)')||'0px' }; } return 'Non supportate'; })() }; mobileLog(`📱 VIEWPORT - ${event}`, info); return info; }
 function initMobileDebug(){ if(document.getElementById('mobile-debug-panel')) return; createDebugPanel(); mobileLog('🚀 Debug mobile inizializzato'); gatherViewportInfo('init'); }
 function setupDebugActivator(){ const activator=document.querySelector('[data-debug-activator]')||document.querySelector('h1'); if(!activator) return; activator.style.cursor='pointer'; activator.style.userSelect='none'; if(!activator.getAttribute('title')) activator.setAttribute('title','Weather Application'); activator.addEventListener('selectstart',e=>e.preventDefault()); let clicks=0; let t=null; activator.addEventListener('click',()=>{ if(window._debugActivated) return; clicks++; if(t) clearTimeout(t); t=setTimeout(()=>clicks=0,1500); if(clicks>=3){ window._debugActivated=true; clicks=0; if(t){clearTimeout(t);t=null;} activator.style.outline='2px solid #27ae60'; setTimeout(()=>activator.style.outline='',1200); initMobileDebug(); gatherViewportInfo('debug-activated'); }}); }
 document.addEventListener('DOMContentLoaded',()=>setupDebugActivator());
 window.addEventListener('load',()=>{ setTimeout(()=>gatherViewportInfo('1sec-after-load'),1000); setTimeout(()=>gatherViewportInfo('3sec-after-load'),3000); });
 window.addEventListener('resize',()=>gatherViewportInfo('resize'));
 window.addEventListener('orientationchange',()=> setTimeout(()=>gatherViewportInfo('orientation-change'),200));
 let scrollTimeout; window.addEventListener('scroll',()=>{ clearTimeout(scrollTimeout); scrollTimeout=setTimeout(()=>gatherViewportInfo('scroll-end'),200); });
 if(window.visualViewport){ window.visualViewport.addEventListener('resize',()=>gatherViewportInfo('visual-viewport-resize')); }
 window.addEventListener('pageshow',e=> gatherViewportInfo(`pageshow-${e.persisted?'cache':'fresh'}`));
 document.addEventListener('visibilitychange',()=>{ if(!document.hidden) gatherViewportInfo('visibility-visible'); });
 window.exportDebugData=function(){ const data={ userAgent:navigator.userAgent, timestamp:new Date().toISOString(), logs:window.debugLogs }; const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'}); const url=URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url; a.download=`debug-mobile-${Date.now()}.json`; a.click(); URL.revokeObjectURL(url); };
 window.emailDebugData=function(){ const data=window.debugLogs.map(l=>`[${l.timestamp}] ${l.message}\n${JSON.stringify(l.data,null,2)}`).join('\n\n'); const subject=encodeURIComponent('Debug Viewport Mobile'); const body=encodeURIComponent(data); window.location.href=`mailto:?subject=${subject}&body=${body}`; };
 if(document.readyState!=='loading') setupDebugActivator();
})();
