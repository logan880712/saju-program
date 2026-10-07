import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
export default defineConfig({
 base: './',
 build: { target: 'es2020', rollupOptions: { input: 'app.html' } },
 plugins: [react(), {
  name: 'development-entry',
  configureServer(server) {
   server.middlewares.use((request,_response,next)=>{
    if(request.url==='/' || request.url?.startsWith('/?')) request.url='/app.html'+request.url.slice(1);
    next();
   });
  },
 }],
});
