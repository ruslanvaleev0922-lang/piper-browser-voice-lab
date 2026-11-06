
import * as ort from 'onnxruntime-web';
import { TtsSession } from '@mintplex-labs/piper-tts-web';

const $ = id => document.getElementById(id);
const entries = [];

const log = message => {
  const line = `${new Date().toLocaleTimeString()} ${message}`;
  entries.push(line);
  $('log').textContent = entries.slice(-180).join('\n');
};

const status = message => {
  $('status').textContent = message;
  log(message);
};

let audioUrl;

ort.env.wasm.numThreads = 1;
ort.env.wasm.proxy = false;
ort.env.wasm.wasmPaths = '/ort/';

log('Piper Browser Voice Lab v0.6');
log('UA: ' + navigator.userAgent);
log('SharedArrayBuffer: ' + (typeof SharedArrayBuffer !== 'undefined'));
log('ONNX Runtime path: /ort/');

async function check() {
  for (const file of [
    'ort-wasm-simd-threaded.wasm',
    'ort-wasm-simd-threaded.mjs'
  ]) {
    const response = await fetch('/ort/' + file, {
      method: 'HEAD'
    });

    log(file + ': HTTP ' + response.status);

    if (!response.ok) {
      throw new Error('Missing /ort/' + file);
    }
  }

  status('ORT files found; session initialization not yet verified.');
}

function reportError(error) {
  log('ERROR NAME: ' + (error?.name || 'unknown'));
  log('ERROR MESSAGE: ' + (error?.message || String(error)));

  if (error?.cause) {
    log('ERROR CAUSE: ' + String(error.cause));
  }

  if (error?.stack) {
    log('STACK: ' + error.stack);
  }

  status('Ошибка генерации. Скопируйте диагностику.');
}

$('check').onclick = async () => {
  try {
    await check();
  } catch (error) {
    reportError(error);
  }
};

$('generate').onclick = async () => {
  const button = $('generate');
  button.disabled = true;

  try {
    await check();

    const text = $('text').value.trim();

    if (!text) {
      throw new Error('Введите текст');
    }

    const voiceId = $('voice').value;
    log('Voice: ' + voiceId);

    status('Создаём TtsSession с локальным ONNX Runtime...');

    const session = await TtsSession.create({
      voiceId,

      wasmPaths: {
        onnxWasm: '/ort/',
        piperData:
          'https://cdn.jsdelivr.net/npm/@diffusionstudio/piper-wasm@1.0.0/build/piper_phonemize.data',
        piperWasm:
          'https://cdn.jsdelivr.net/npm/@diffusionstudio/piper-wasm@1.0.0/build/piper_phonemize.wasm'
      },

      progress: p => {
        if (p?.total) {
          const percent = Math.floor(100 * p.loaded / p.total);

          if (percent % 10 === 0 || percent === 100) {
            log('Model download ' + percent + '%');
          }
        }
      },

      logger: message => log('Piper: ' + message)
    });

    log('ONNX session initialized');
    status('Генерируем немецкую речь...');

    const blob = await session.predict(text);

    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }

    audioUrl = URL.createObjectURL(blob);
    $('player').src = audioUrl;

    status('Аудио готово. Нажмите Play.');

  } catch (error) {
    reportError(error);
  } finally {
    button.disabled = false;
  }
};

$('copy').onclick = async () => {
  try {
    await navigator.clipboard.writeText(entries.join('\n'));
    $('status').textContent = 'Диагностика скопирована';
  } catch (error) {
    $('status').textContent =
      'Не удалось скопировать: ' + String(error);
  }
};
