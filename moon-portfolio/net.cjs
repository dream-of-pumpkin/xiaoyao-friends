const { chromium } = require('playwright-core');
(async()=>{
  const b=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true});
  const p=await b.newPage({viewport:{width:1440,height:1000}});
  p.on('response',r=>{ if(r.status()>=400) console.log('HTTP',r.status(),r.url()); });
  await p.goto('http://127.0.0.1:5173/',{waitUntil:'networkidle'});
  await p.waitForTimeout(1500);
  await b.close();
})();
