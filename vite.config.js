import { defineConfig } from 'vite';
import { copyFileSync, mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
// Copy the WASM runtime files from the SAME installed onnxruntime-web version.
const files=['ort-wasm-simd-threaded.mjs','ort-wasm-simd-threaded.wasm'];
function copyOrt(){return {name:'copy-ort-runtime',closeBundle(){const dest=resolve('dist/ort');mkdirSync(dest,{recursive:true});for(const f of files)copyFileSync(resolve('node_modules/onnxruntime-web/dist',f),resolve(dest,f));}}}
export default defineConfig({base:'./',plugins:[copyOrt()],resolve:{dedupe:['onnxruntime-web']},build:{target:'es2022'}});
