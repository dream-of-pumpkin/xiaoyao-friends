const { chromium } = require('playwright-core');
(async()=>{
  const b=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true});
  for(const [n,w,h] of [['375',375,812],['768',768,1024]]){
    const p=await b.newPage({viewport:{width:w,height:h},isMobile:w<500,hasTouch:w<500});
    const errs=[]; p.on('pageerror',e=>errs.push(e.message));
    await p.goto('http://127.0.0.1:5173/',{waitUntil:'networkidle'});
    await p.waitForTimeout(1500);
    await p.screenshot({path:`_shots/m${n}.png`,fullPage:true});
    const o=await p.evaluate(()=>({
      scrollW:document.documentElement.scrollWidth, winW:innerWidth,
      cards:document.querySelectorAll('.card').length,
      girlW:Math.round(document.getElementById('girl').getBoundingClientRect().width),
      fonts:document.fonts.status}));
    console.log(n, JSON.stringify(o), 'err:',errs.length?errs.join('|'):'(无)');
    await p.close();
  }
  // 平滑滚动测试
  const p=await b.newPage({viewport:{width:1440,height:900}});
  await p.goto('http://127.0.0.1:5173/',{waitUntil:'networkidle'});
  await p.waitForTimeout(1200);
  await p.click('.topnav a[href="#demo"]');
  await p.waitForTimeout(1600);
  const y=await p.evaluate(()=>Math.round(window.scrollY));
  const demoTop=await p.evaluate(()=>Math.round(document.getElementById('demo').getBoundingClientRect().top));
  console.log('滚动后 scrollY=',y,' demo 距顶=',demoTop,'(应≈76顶栏偏移)');
  await b.close();
})();
