import fs from 'node:fs';import path from 'node:path';import zlib from 'node:zlib';
function walk(dir){return fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(dir,e.name)):[path.join(dir,e.name)]);}
const files=walk('dist').filter(f=>/\.(js|css|html|json|png|svg|webmanifest|txt)$/.test(f));
const bytes=files.reduce((sum,file)=>sum+zlib.gzipSync(fs.readFileSync(file)).length,0);
console.log(`Whole offline app: ${(bytes/1024).toFixed(1)} KiB gzip (${files.length} files)`);
if(bytes>200*1024)throw Error('Exceeds 200 KiB compressed budget');
