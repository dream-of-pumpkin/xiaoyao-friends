const { chromium } = require('playwright-core');
(async()=>{
  const b=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true});
  const p=await b.newPage({viewport:{width:1440,height:1000},deviceScaleFactor:1});
  const errs=[]; p.on('pageerror',e=>errs.push(e.message));
  p.on('console',m=>{if(m.type()==='error')errs.push(m.text());});
  await p.goto('http://127.0.0.1:5173/',{waitUntil:'networkidle'});
  await p.waitForTimeout(1800);
  const g=await p.$('.girl');
  await g.screenshot({path:'_shots/girl2.png'});

  // 转头测试：鼠标移到左侧 → 头应左转
  const gb=await p.evaluate(()=>{const r=document.getElementById('girl').getBoundingClientRect();
    return {x:r.left+r.width/2,y:r.top+r.height*0.3};});
  await p.mouse.move(gb.x-400, gb.y);
  await p.waitForTimeout(1000);
  const left=await p.evaluate(()=>{
    const h=document.querySelector('.girl-head');
    const e=document.querySelector('.girl-eye.l');
    return {rot:getComputedStyle(h).getPropertyValue('--head-rot'),
            ex:getComputedStyle(e).getPropertyValue('--ex')};});
  await g.screenshot({path:'_shots/girl-left.png'});

  await p.mouse.move(gb.x+400, gb.y);
  await p.waitForTimeout(1000);
  const right=await p.evaluate(()=>{
    const h=document.querySelector('.girl-head');
    const e=document.querySelector('.girl-eye.l');
    return {rot:getComputedStyle(h).getPropertyValue('--head-rot'),
            ex:getComputedStyle(e).getPropertyValue('--ex')};});
  await g.screenshot({path:'_shots/girl-right.png'});

  console.log('向左:',JSON.stringify(left));
  console.log('向右:',JSON.stringify(right));
  console.log('errors:', errs.length?errs.join('|'):'(无)');
  await b.close();
})();
