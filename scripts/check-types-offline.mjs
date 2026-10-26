// Optional: use a locally available TypeScript compiler when dependencies cannot be installed.
// node scripts/check-types-offline.mjs <absolute path to typescript.js>
import fs from 'node:fs';import path from 'node:path';import {createRequire} from 'node:module';
const require=createRequire(import.meta.url),ts=require(process.argv[2]||'typescript');
const walk=dir=>fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(dir,e.name)):[path.join(dir,e.name)]);
const sources=[...walk('src'),...walk('e2e'),'vite.config.ts','playwright.config.ts'].filter(f=>/\.tsx?$/.test(f));
const errors=[];
for(const file of sources){const result=ts.transpileModule(fs.readFileSync(file,'utf8'),{fileName:file,reportDiagnostics:true,compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ESNext,jsx:ts.JsxEmit.ReactJSX,isolatedModules:true}});errors.push(...(result.diagnostics||[]).filter(d=>d.category===ts.DiagnosticCategory.Error));}
const pureFiles=[...walk('src/theory'),...walk('src/data')].filter(f=>f.endsWith('.ts')&&!f.endsWith('.test.ts'));
const program=ts.createProgram(pureFiles,{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ESNext,moduleResolution:ts.ModuleResolutionKind.Bundler,strict:true,skipLibCheck:true,resolveJsonModule:true,esModuleInterop:true,noEmit:true,types:[]});
errors.push(...ts.getPreEmitDiagnostics(program));
if(errors.length){console.error(ts.formatDiagnosticsWithColorAndContext(errors,{getCurrentDirectory:()=>process.cwd(),getCanonicalFileName:f=>f,getNewLine:()=> '\n'}));process.exitCode=1;}
else console.log(`PASS: ${sources.length} TypeScript/TSX files parsed; theory + data modules passed strict TypeScript checking. React UI type checking still requires installed dependencies.`);
