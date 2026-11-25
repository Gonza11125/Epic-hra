// Usage: npm install --no-save playwright && node tools/check-web.cjs [repo-root]
// NEXUS_CHROMIUM, NEXUS_THREE, NEXUS_ORBIT can point at local browser/dependency files.
const {chromium}=require('playwright');
const {createServer}=require('node:http');
const fs=require('node:fs/promises'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(process.argv[2]||path.join(__dirname,'..'));
(async()=>{
 const server=createServer(async(req,res)=>{
   const p=path.resolve(root,'.'+new URL(req.url,'http://localhost').pathname);
   if(p!==root&&!p.startsWith(root+path.sep)){res.writeHead(403).end();return;}
   try{const f=p===root?path.join(root,'index.html'):p;
     const mime={'.html':'text/html','.js':'text/javascript','.json':'application/json'}[path.extname(f)];
     res.writeHead(200,{'Content-Type':mime||'application/octet-stream'}).end(await fs.readFile(f));}
   catch{res.writeHead(404).end()}
 });
 await new Promise(done=>server.listen(0,'127.0.0.1',done));
 const base='http://127.0.0.1:'+server.address().port;
 let browser;
 try{
   browser=await chromium.launch({executablePath:process.env.NEXUS_CHROMIUM||undefined,
     args:['--enable-unsafe-swiftshader','--use-angle=swiftshader',...(process.env.NEXUS_SINGLE_PROCESS?['--no-zygote','--single-process']:[])]});
   const page=await browser.newPage({viewport:{width:950,height:540}});
   const errors=[];page.on('pageerror',e=>{errors.push(String(e));console.error(e.message)});
   page.on('console',m=>{if(m.type()==='error'&&!m.text().includes('favicon')){errors.push(m.text());console.error(m.text().slice(0,1000));}});
   for(const [pattern,file] of [['**/three.module.js',process.env.NEXUS_THREE],['**/OrbitControls.js',process.env.NEXUS_ORBIT]])
     if(file) await page.route(pattern,r=>r.fulfill({path:file,contentType:'application/javascript',headers:{'Access-Control-Allow-Origin':'*'}}));
   await page.goto(base+'/index.html');await page.locator('#start').click({timeout:30000});
   await page.waitForFunction(()=>document.querySelector('#hud').classList.contains('on'),null,{timeout:20000});
   console.log('Settlement:',await page.locator('#regionLabel').innerText());
   await page.goto(base+'/planet-atlas.html');await page.waitForFunction(()=>document.querySelector('#status').textContent.includes('biom'),null,{timeout:30000});
   await page.locator('#tour').click();await page.waitForTimeout(450);console.log('Atlas:',await page.locator('#status').innerText());
   await page.goto(base+'/planet-explorer.html');
   const landed=()=>page.waitForFunction(()=>/Přistání dokončeno|Na povrchu/.test(document.querySelector('#message').textContent),null,{timeout:160000});
   await landed();const start=await page.locator('#position').innerText();
   const hasSave=await page.locator('#saveExplorer').count();

   await page.keyboard.down('Shift');await page.keyboard.down('w');
   await page.waitForFunction(()=>{const m=/pěšky ([\d ,\u00a0]+) m/.exec(document.querySelector('#stats').textContent);return m&&Number(m[1].replace(/\s/g,'').replace(',','.'))>=12},null,{timeout:35000});
   await page.keyboard.press('Space');await page.waitForTimeout(1300);
   await page.keyboard.up('w');await page.keyboard.up('Shift');
   assert.notEqual(await page.locator('#position').innerText(),start);
   console.log('Walk:',await page.locator('#stats').textContent());
   const moved=await page.locator('#position').innerText();
   await page.locator('#view').click();
   if(await page.locator('#toolsToggle').count())await page.locator('#toolsToggle').click();
   await page.locator('#texture').click();
   await page.selectOption('#quality','high');await page.selectOption('#daylight','day');await page.waitForTimeout(1400);
   assert.match(await page.locator('#view').innerText(),/1\. osoba/);
   if(hasSave){
     await page.locator('#saveExplorer').click();
     await page.waitForFunction(()=>document.querySelector('#message').textContent.includes('uložena'));
     const expected=await page.evaluate(()=>{
       const p=JSON.parse(localStorage.getItem('nexus-elyra-explorer-v1')).position;
       const fmt=n=>n.toLocaleString('cs-CZ',{maximumFractionDigits:5});
       return fmt(Math.asin(p[1])*180/Math.PI)+'° / '+fmt(Math.atan2(p[2],p[0])*180/Math.PI)+'°';
     });
     await page.reload();await landed();assert.ok(!(await page.locator('#position').innerText()).startsWith(expected));
     await page.locator('#loadExplorer').click();
     await page.waitForFunction(s=>document.querySelector('#position').textContent.startsWith(s),expected);
     await landed();
     assert.match(await page.locator('#view').innerText(),/1\. osoba/);
     console.log('Explorer save restored:',moved);
     await page.selectOption('#location','valley:water-bank');await landed();
     await page.keyboard.down('w');await page.keyboard.down('Shift');
     await page.waitForFunction(()=>{const m=/pěšky ([\d ,\u00a0]+) m/.exec(document.querySelector('#stats').textContent);return m&&Number(m[1].replace(/\s/g,'').replace(',','.'))>=36},null,{timeout:110000});
     await page.keyboard.up('Shift');await page.keyboard.up('w');
     console.log('Southern bank into pond:',await page.locator('#stats').innerText());
   }
   await page.goto(base+'/planet-explorer.html?start=nova-porch');await landed();
   await page.keyboard.down('w');await page.keyboard.down('Shift');
   const indoors=()=>page.waitForFunction(()=>document.querySelector('#place').textContent.startsWith('NOVA'),null,{timeout:60000});
   await indoors();await page.keyboard.up('Shift');await page.keyboard.up('w');
   await page.locator('#saveExplorer').click();
   await page.waitForFunction(()=>document.querySelector('#message').textContent.includes('uložena'));
   await page.reload();await landed();await page.locator('#loadExplorer').click();await indoors();await landed();
   await page.keyboard.down('s');
   await page.waitForFunction(()=>document.querySelector('#place').textContent.startsWith('Obytná'));
   await page.keyboard.up('s');
   await page.selectOption('#location','valley:basin-pass');
   await page.waitForFunction(()=>document.querySelector('#place').textContent==='Severní kotlina');await landed();
   await page.locator('#valleyMap').click();assert.equal(await page.locator('#mapArea').inputValue(),'north');
   await page.locator('#valleyMap').click();
   console.log('NOVA entry, interior save/restore, exit and northern pass map passed.');
   assert.equal(errors.length,0,errors.join('\n'));
 } finally{if(browser)await browser.close();server.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
