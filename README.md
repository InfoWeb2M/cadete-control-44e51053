# Interface Provectus

React/Vite/TypeScript, Tailwind e componentes existentes. Requer Node 22 ou superior.

`npm ci` · `npm run dev` (127.0.0.1:8080) · `npm run build` · `npm test`

O build inclui checagem TypeScript. `VITE_API_URL` usa `/api` por padrão. O proxy de desenvolvimento encaminha ao FastAPI em 127.0.0.1:8000 removendo apenas esse prefixo, igual ao Nginx do Compose. Use `package-lock.json`; lockfiles Bun concorrentes foram removidos.
