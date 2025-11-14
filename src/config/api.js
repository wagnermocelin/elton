// Configuração da URL da API
// Em produção: usa backend do Vercel com Supabase
// Em desenvolvimento: usa localhost

const API_URL = import.meta.env.VITE_API_URL 
  ? import.meta.env.VITE_API_URL.endsWith('/api') 
    ? import.meta.env.VITE_API_URL 
    : `${import.meta.env.VITE_API_URL}/api`
  : import.meta.env.PROD 
    ? 'https://elton-hk8q.vercel.app/api'  // Produção - Vercel (CORS aberto)
    : 'http://localhost:5000/api';          // Desenvolvimento - Local

export default API_URL;

// ✅ Configuração automática:
// - npm run dev → localhost:5000
// - npm run build → usa VITE_API_URL ou fallback Vercel
