/* app.js — вынесено из утверждённых шаблонов (урок + оглавление; обновлено по сайт_шаблон_урока.html от 2026-10-23). Поведение: тема, тогглы 拼音/RU, поповеры слов, сбор ответов, подсветка секций. */
(function(){
  const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
  const store={get:k=>{try{return localStorage.getItem(k)}catch(e){return null}},set:(k,v)=>{try{localStorage.setItem(k,v)}catch(e){}}};
  const root=document.documentElement, th=$('#tTheme');
  const saved=store.get('theme'); if(saved){root.dataset.theme=saved}
  const curTheme=()=>root.dataset.theme||(matchMedia('(prefers-color-scheme:dark)').matches?'dark':'light');
  if(th){
    const syncTheme=()=>th.setAttribute('aria-pressed',String(curTheme()==='dark'));
    syncTheme();
    th.onclick=()=>{root.dataset.theme=curTheme()==='dark'?'light':'dark';store.set('theme',root.dataset.theme);syncTheme()};
  }
  const mk=(id,cls,key)=>{const b=$(id);if(!b)return;const apply=on=>{b.setAttribute('aria-pressed',String(on));document.body.classList.toggle(cls,!on);store.set(key,on?'1':'0')};apply(store.get(key)!=='0');b.onclick=()=>apply(b.getAttribute('aria-pressed')!=='true')};
  mk('#tPy','hide-py','py'); mk('#tRu','hide-ru','ru');

  /* popover — только для слов в тексте урока (.ctext) и подводке */
  const killPop=()=>$$('.pop').forEach(p=>p.remove());
  document.addEventListener('click',e=>{
    const w=e.target.closest('.ctext .nw,.ctext .rw'); killPop(); if(!w)return;
    const p=document.createElement('div');p.className='pop';
    const hideRu=document.body.classList.contains('hide-ru'), hidePy=document.body.classList.contains('hide-py');
    p.innerHTML=`<span class="w">${w.dataset.w||w.textContent}</span>`+(w.dataset.p&&!hidePy?`<span class="p">${w.dataset.p}</span>`:'')+`<div class="d">${w.dataset.d||''}</div>`+(w.dataset.r&&!hideRu?`<div class="r">${w.dataset.r}</div>`:'')+(w.dataset.g?`<span class="g">${w.dataset.g}</span>`:'');
    document.body.appendChild(p);
    const r=w.getBoundingClientRect(), pw=p.offsetWidth;
    let x=r.left+scrollX, y=r.bottom+scrollY+8; if(x+pw>innerWidth-12)x=innerWidth-12-pw+scrollX;
    p.style.left=Math.max(12,x)+'px'; p.style.top=y+'px';
    e.stopPropagation();
  });
  document.addEventListener('keydown',e=>{if(e.key==='Escape')killPop()});
  let st=0;window.addEventListener('scroll',()=>{if(st)return;st=requestAnimationFrame(()=>{st=0;if(document.querySelector('.pop'))killPop()})},{passive:true});

  /* answers */
  const ans={};
  const ansBox=$('#answers'), ansLine=$('#ansline');
  const render=()=>{const parts=[];$$('[data-ex]').forEach(sec=>{const k=sec.dataset.ex;const qs=Object.keys(ans[k]||{}).sort((a,b)=>a-b);if(qs.length)parts.push(k+' '+qs.map(q=>q+'-'+ans[k][q]).join(', '))});if(ansLine)ansLine.textContent=parts.join('；')};
  $$('.opt').forEach(b=>b.onclick=()=>{const sec=b.closest('[data-ex]'),q=b.closest('.q');q.querySelectorAll('.opt').forEach(o=>o.setAttribute('aria-pressed','false'));b.setAttribute('aria-pressed','true');(ans[sec.dataset.ex]=ans[sec.dataset.ex]||{})[q.dataset.q]=b.dataset.v;if(ansBox)ansBox.classList.add('show');render()});
  const cp=$('#copy');
  if(cp)cp.onclick=async()=>{const t=ansLine.textContent;try{await navigator.clipboard.writeText(t);cp.textContent='Скопировано ✓';setTimeout(()=>cp.textContent='Скопировать ответы',1500)}catch(e){prompt('Скопируй:',t)}};

  /* section strip (из шаблона 2026-10-23: без smooth-прокрутки полосы, клик — плавный переход к секции) */
  const links=$$('#secnav a'), secs=links.map(a=>$(a.getAttribute('href'))), nav=$('#secnav');
  if(links.length&&nav){
    let cur=-1, raf=0;
    const setActive=i=>{if(i===cur||i<0)return;cur=i;links.forEach((l,k)=>l.classList.toggle('on',k===i));const el=links[i],L=el.offsetLeft-nav.clientWidth/2+el.offsetWidth/2;nav.scrollTo({left:Math.max(0,L),behavior:'auto'})};
    if('IntersectionObserver' in window){
      const io=new IntersectionObserver(es=>{es.forEach(en=>{if(en.isIntersecting){const i=secs.indexOf(en.target);if(raf)cancelAnimationFrame(raf);raf=requestAnimationFrame(()=>setActive(i))}})},{rootMargin:'-40% 0px -55% 0px',threshold:0});
      secs.forEach(s=>s&&io.observe(s));
    }
    links.forEach((a,i)=>a.addEventListener('click',e=>{if(!secs[i])return;e.preventDefault();secs[i].scrollIntoView({behavior:'smooth',block:'start'});history.replaceState(null,'',a.getAttribute('href'))}));
  }
})();
