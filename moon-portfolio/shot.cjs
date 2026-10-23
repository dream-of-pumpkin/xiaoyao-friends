const { chromium } = require('playwright-core');
(async()=>{
  const b=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true});
  const p=await b.newPage({viewport:{width:1440,height:1000},deviceScaleFactor:1});
  const errs=[]; p.on('pageerror',e=>errs.push(e.message));
  p.on('console',m=>{if(m.type()==='error')errs.push('console: '+m.text());});
  await p.goto('http://127.0.0.1:5173/',{waitUntil:'networkidle'});
  await p.waitForTimeout(2000);
  await p.screenshot({path:'_shots/full.png',fullPage:true});
  await p.screenshot({path:'_shots/top.png'});
  // 角色特写
  const g=await p.$('.girl');
  if(g) await g.screenshot({path:'_shots/girl.png'});
  // hover 卡片
  const c=await p.$('#demo');
  if(c){ await c.hover(); await p.waitForTimeout(700); await c.screenshot({path:'_shots/card-hover.png'}); }
  console.log('errors:', errs.length?errs.join('|'):'(无)');
  await b.close();
})();
