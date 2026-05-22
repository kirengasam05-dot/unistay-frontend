# Run this from the project root if npm install fails on Windows
npm config set registry https://registry.npmjs.org/
npm cache clean --force
Remove-Item node_modules -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item package-lock.json -Force -ErrorAction SilentlyContinue
npm install --legacy-peer-deps
npm run dev
