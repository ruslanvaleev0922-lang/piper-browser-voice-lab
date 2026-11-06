# Piper Browser Voice Lab v0.5 (experimental)

This is a **source project**, NOT a ready-to-upload `index.html`. It must be built with `npm install && npm run build`. A GitHub Actions workflow is included for building without a computer.

## iPhone-only build
1. On GitHub, create a new repository (do NOT use the TELC B1 Trainer repository).
2. Upload all project files preserving paths, including `.github/workflows/build.yml`.
3. Open GitHub Actions -> Build Piper browser lab -> Run workflow (or wait for the push build).
4. Download the artifact `piper-browser-v05-static` from the successful run, unzip it in Files.
5. In the existing Hugging Face Static Space, upload **the contents of dist/**: `index.html`, `assets/` and `ort/`, preserving folders. Do not upload the source `index.html` alone.
6. Open the Space App, refresh, click Check ONNX and then Generate.

## Important caveats
- This package has not been built or tested in this environment because npm registry network access is unavailable.
- The Piper dependency may bundle or dynamically import its own ONNX Runtime. Vite `resolve.dedupe` is intended to reduce duplicate modules but does not guarantee it. The exact runtime behavior must be verified after build.
- The browser may lack SIMD support or sufficient memory. ONNX Runtime and voice model licenses should be reviewed before broader distribution.
- No changes to Netlify or TELC B1 Trainer are needed.
