(() => {
  const ids=['hero','about','services','work','testimonial','contact','aboutus'];
  const panels=ids.map(id=>document.getElementById(id));
  const nav=[...document.querySelectorAll('[data-section]')];
  const next=document.getElementById('nextBtn');
  let index=0;
  let hasNavigatedFromHero=false;
  function go(to,{historyMode='replace',hash=true}={}){
    const n=typeof to==='number'?to:ids.indexOf(to);
    if(n<0||n>=ids.length)return;
    index=n;
    document.body.classList.toggle('start-here-visible', n === 0);
    panels.forEach((p,i)=>{p.classList.toggle('active',i===n);p.setAttribute('aria-hidden',String(i!==n));if(i===n)p.scrollTop=0;});
    document.querySelectorAll('.nav-item').forEach(b=>b.classList.toggle('active',b.dataset.section===ids[n]));
    // The Next Section control starts appearing only after leaving the hero.
    next.closest('.section-controls').hidden = n === 0;
    next.disabled=n===ids.length-1;
    if(hash){
      const targetHash=n===0?'':'#'+ids[n];
      if(historyMode==='push')history.pushState({section:ids[n]},'',targetHash||location.pathname+location.search);
      else history.replaceState({section:ids[n]},'',targetHash||location.pathname+location.search);
    }
  }
  nav.forEach(el=>el.addEventListener('click',e=>{
    e.preventDefault();
    const target=el.dataset.section;
    // First section selection creates one history entry; subsequent header
    // selections replace it, so browser Back returns directly to the hero.
    if(!hasNavigatedFromHero){
      hasNavigatedFromHero=true;
      go(target,{historyMode:'push'});
    } else go(target,{historyMode:'replace'});
  }));
  document.querySelectorAll('[data-next]').forEach(el=>el.addEventListener('click',()=>{
    if(!hasNavigatedFromHero){hasNavigatedFromHero=true;go(index+1,{historyMode:'push'});}
    else go(index+1,{historyMode:'replace'});
  }));
  next.addEventListener('click',()=>{
    if(index>=ids.length-1)return;
    if(!hasNavigatedFromHero){hasNavigatedFromHero=true;go(index+1,{historyMode:'push'});}
    else go(index+1,{historyMode:'replace'});
  });
  window.addEventListener('popstate',()=>{
    const hash=location.hash.slice(1);
    const target=ids.includes(hash)?hash:'hero';
    if(target==='hero')hasNavigatedFromHero=false;
    else hasNavigatedFromHero=true;
    go(target,{hash:false});
  });
  document.addEventListener('keydown',e=>{
    if(e.altKey||e.ctrlKey||e.metaKey||e.target.closest('input,textarea,select'))return;
    if(['ArrowRight','PageDown'].includes(e.key)){e.preventDefault();if(index<ids.length-1){if(!hasNavigatedFromHero){hasNavigatedFromHero=true;go(index+1,{historyMode:'push'});}else go(index+1,{historyMode:'replace'});}}
  });
  go('hero',{hash:false});
  document.getElementById('contactForm').addEventListener('submit',e=>{
    e.preventDefault();const d=new FormData(e.currentTarget);const subject=encodeURIComponent('Studio enquiry from '+d.get('name'));const body=encodeURIComponent('Name: '+d.get('name')+'\nEmail: '+d.get('email')+'\n\n'+d.get('message'));window.location.href='mailto:hello@codesketchers.studio?subject='+subject+'&body='+body;
  });
})();
