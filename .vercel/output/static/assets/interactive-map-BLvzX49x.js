const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/leaflet-src-DtpoAO3a.js","assets/rolldown-runtime-CNC7AqOf.js","assets/leaflet-DM_40lI3.js","assets/leaflet-vh-t_kPv.css"])))=>i.map(i=>d[i]);
import{a as e}from"./rolldown-runtime-CNC7AqOf.js";import{n as t,t as n}from"./jsx-runtime-BtyjnKZj.js";import{A as r,a as i,o as a}from"./createLucideIcon-CmvlQSB6.js";import{u as o}from"./site-nav-H67q50Uo.js";import{F as s,P as c}from"./index-3chk3oFK.js";var l=e(t(),1),u=n();s();var d={transfert:{label:`Centre de transfert`,color:`#0ea5e9`,glyph:`T`},regroupement:{label:`Point de regroupement`,color:`#f59e0b`,glyph:`R`},valorisation:{label:`Centre de valorisation`,color:`#10b981`,glyph:`V`},traitement:{label:`Centre de traitement`,color:`#6366f1`,glyph:`X`},collecte:{label:`Zone de collecte`,color:`#14b8a6`,glyph:`C`},tri:{label:`Centre de tri`,color:`#22c55e`,glyph:`Tri`},recyclage:{label:`Recyclage`,color:`#84cc16`,glyph:`♻`}};function f({commune:t,reports:n=[],heightClassName:s=`h-[420px]`}){let f=(0,l.useRef)(null),p=(0,l.useRef)(null);return(0,l.useEffect)(()=>{let s=!1;return(async()=>{let l=(await c(async()=>{let{default:t}=await import(`./leaflet-src-DtpoAO3a.js`).then(t=>e(t.t(),1));return{default:t}},__vite__mapDeps([0,1]))).default;if(await c(()=>import(`./leaflet-DM_40lI3.js`).then(e=>e.t),__vite__mapDeps([2,1,3])),s||!f.current)return;let u=t?a.find(e=>e.id===t):null,m=l.map(f.current,{zoomControl:!0,scrollWheelZoom:!0}).setView(u?.center??r.center,u?14:r.defaultZoom);l.tileLayer(`https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png`,{attribution:`© OpenStreetMap · © CARTO · EcoKin Smart`,maxZoom:19}).addTo(m),(u?[u]:a).forEach(e=>{l.circle(e.center,{radius:u?1900:1200,color:e.color,weight:1.6,opacity:.55,fillOpacity:.06,dashArray:`5 5`}).bindTooltip(`Commune de ${e.name}`,{direction:`top`}).addTo(m)}),i.filter(e=>!t||e.commune===t).forEach(e=>{let t=d[e.kind]??d.collecte;l.marker([e.lat,e.lng],{icon:l.divIcon({className:``,html:`<div style="background:${t.color};color:#fff;width:28px;height:28px;display:grid;place-items:center;border-radius:8px;border:2px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,.25);font:800 10px/1 Inter,sans-serif;">${t.glyph}</div>`,iconSize:[28,28],iconAnchor:[14,14]})}).bindPopup(`<strong>${e.name}</strong><br/>${t.label}`).addTo(m)}),n.forEach(e=>{if(!e.lat||!e.lng)return;let t=o[e.urgency],n=e.urgency===`critique`?`#ef4444`:e.urgency===`eleve`?`#f97316`:`#10b981`,r=e.urgency===`critique`?10:e.urgency===`eleve`?8:6,i=`<div style="background:${n};color:#fff;width:${r*2}px;height:${r*2}px;display:grid;place-items:center;border-radius:50%;border:2px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,.3);font:800 9px/1 Inter,sans-serif;">!</div>`;l.marker([e.lat,e.lng],{icon:l.divIcon({className:``,html:i,iconSize:[r*2,r*2],iconAnchor:[r,r]})}).bindPopup(`
            <div style="min-width:220px;font-family:Inter,sans-serif;font-size:12px;">
              <div style="font-weight:700;font-size:14px;margin-bottom:4px;">${e.id}</div>
              <div style="display:flex;gap:4px;margin-bottom:6px;">
                <span style="background:${n};color:#fff;padding:2px 8px;border-radius:9999px;font-size:9px;font-weight:700;text-transform:uppercase;">
                  ${t.label}
                </span>
                <span style="background:#f1f5f9;padding:2px 8px;border-radius:9999px;font-size:9px;font-weight:600;text-transform:capitalize;">
                  ${e.category}
                </span>
              </div>
              <div style="border-top:1px solid #e2e8f0;padding-top:6px;margin-top:4px;">
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:4px;font-size:11px;">
                  ${e.commune?`<div><span style="color:#64748b;">Commune :</span> <strong>${e.commune}</strong></div>`:``}
                  ${e.volumeM3?`<div><span style="color:#64748b;">Volume :</span> <strong>${e.volumeM3} m³</strong></div>`:``}
                  ${e.weightTons?`<div><span style="color:#64748b;">Poids :</span> <strong>${e.weightTons} t</strong></div>`:``}
                  ${e.priorityScore?`<div><span style="color:#64748b;">Priorité :</span> <strong>${e.priorityScore}/100</strong></div>`:``}
                </div>
                ${e.composition&&e.composition.length>0?`
                  <div style="margin-top:4px;font-size:10px;color:#64748b;">
                    Composition : ${e.composition.map(e=>`${e.material} ${e.percentage}%`).join(` · `)}
                  </div>
                `:``}
                ${e.dimensions?`
                  <div style="margin-top:2px;font-size:10px;color:#64748b;">
                    ${e.dimensions.lengthM}m × ${e.dimensions.widthM}m × ${e.dimensions.heightAvgM}m
                  </div>
                `:``}
              </div>
              <div style="margin-top:6px;font-size:10px;color:#94a3b8;">
                ${new Date(e.createdAt).toLocaleString(`fr-FR`)}
              </div>
            </div>
          `).addTo(m)}),p.current=m,setTimeout(()=>m.invalidateSize(),120)})(),()=>{s=!0,p.current&&=(p.current.remove(),null)}},[t,n]),(0,u.jsx)(`div`,{ref:f,className:`${s} w-full overflow-hidden rounded-lg border bg-secondary`})}export{f as t};