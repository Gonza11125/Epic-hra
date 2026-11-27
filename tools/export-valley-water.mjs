// Export vodní sítě Údolí 07 do valley-07-water.json (pro Unreal a další nástroje) a obnovení valley-07.json
// z valleyManifest() (obsahuje odkaz na vodní data). Použití: node tools/export-valley-water.mjs [--check]
// --check: nic nezapisuje, jen ověří, že soubory odpovídají generátoru (exit 1 při rozdílu).
import fs from 'fs';
import {fileURLToPath} from 'url';
import {valleyManifest} from '../elyra-geography.js?v=4';
import {waterExport} from '../valley-water.js?v=01470';
const root=fileURLToPath(new URL('..',import.meta.url)),compact=t=>t.replace(/\[\s+([-\d.,\s]+?)\s+\]/g,(m,inner)=>'['+inner.replace(/\s+/g,'')+']'),files={'valley-07-water.json':compact(JSON.stringify(waterExport(),null,1))+'\n','valley-07.json':JSON.stringify(valleyManifest(),null,2)+'\n'};
let bad=0;for(const [name,text] of Object.entries(files)){const p=root+name,old=fs.existsSync(p)?fs.readFileSync(p,'utf8'):'';if(process.argv.includes('--check')){if(old!==text){bad++;console.log('ZASTARALÉ:',name)}else console.log('OK:',name)}else{fs.writeFileSync(p,text);console.log('zapsáno',name,text.length,'B')}}
process.exit(bad?1:0);
