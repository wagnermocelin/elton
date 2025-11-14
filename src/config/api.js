// Configuração da URL da API
// Em produção: usa backend do Render (MongoDB Atlas)
// Em desenvolvimento: usa localhost

// Usar variável de ambiente ou fallback
// Se VITE_API_URL já tem /api no final, não adicionar novamente
const API_URL = import.meta.env.VITE_API_URL 
  ? import.meta.env.VITE_API_URL.endsWith('/api') 
    ? import.meta.env.VITE_API_URL 
    : `${import.meta.env.VITE_API_URL}/api`
  : import.meta.env.PROD 
    ? 'https://power-training-backend.onrender.com/api'  // Produção - Render (com Supabase)
    : 'http://localhost:5000/api';                        // Desenvolvimento - Local

export default API_URL;

// ✅ Configuração automática:
// - npm run dev → localhost:5000
// - npm run build → usa VITE_API_URL ou fallback Vercel
