import * as ort from 'onnxruntime-web/wasm';
import { predict } from '@mintplex-labs/piper-tts-web';
const $ = id => document.getElementById(id);
const entries=[];
const log = message => {entries.push(`${new Date().toLocaleTimeString()} ${message}`);$('log').textContent=entries.slice(-120).join('\n');};
const status = message => {$('status').textContent=message;log(message);};
let url;
ort.env.wasm.numThreads=1;
ort.env.wasm.proxy=false;
// The .mjs and .wasm assets are copied by vite.config.js to the same origin.
ort.env.wasm.wasmPaths={wasm:'/ort/ort-wasm-simd-threaded.wasm',mjs:'/ort/ort-wasm-simd-threaded.mjs'};
log('User agent: '+navigator.userAgent);
log('SharedArrayBuffer: '+(typeof SharedArrayBuffer!=='undefined'));
log('ONNX version configured: 1.27.0, single-thread');
async function check(){
  for(const file of ['ort-wasm-simd-threaded.wasm','ort-wasm-simd-threaded.mjs']){
    const r=await fetch('/ort/'+file,{method:'HEAD'});log(file+': HTTP '+r.status);if(!r.ok)throw Error('Missing '+file);
  }
  status('ORT assets available. Session initialization requires a model.');
}
$('check').onclick=async()=>{try{await check()}catch(e){log('ERROR '+e.stack);status('Проверка не прошла')}};
$('generate').onclick=async()=>{
 const btn=$('generate');btn.disabled=true;
 try{
  await check();const text=$('text').value.trim();if(!text)throw Error('Введите текст');
  status('Генерация: модель может загружаться несколько минут...');
  let last=-1;
  const blob=await predict({text,voiceId:$('voice').value},p=>{if(p?.total){const pct=Math.floor(100*p.loaded/p.total);if(pct>=last+10||pct===100){last=pct;log('Model download '+pct+'%')}}});
  if(url)URL.revokeObjectURL(url);url=URL.createObjectURL(blob);$('player').src=url;status('Аудио готово. Нажмите Play.');
 }catch(e){log('ERROR '+(e?.stack||e));status('Ошибка генерации. Скопируйте диагностику.')}finally{btn.disabled=false}
};
$('copy').onclick=async()=>{try{await navigator.clipboard.writeText(entries.join('\n'));$('status').textContent='Скопировано'}catch(e){$('status').textContent='Скопировать не удалось'}};
