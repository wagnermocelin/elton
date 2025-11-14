// Configuração da URL da API
// Em produção: usa backend do Render (MongoDB Atlas)
// Em desenvolvimento: usa localhost

// Usar variável de ambiente ou fallback
const API_URL = import.meta.env.VITE_API_URL 
  ? `${import.meta.env.VITE_API_URL}/api`
  : import.meta.env.PROD 
    ? 'https://power-training-backend.vercel.app/api'  // Produção - Vercel (atualizar depois)
    : 'http://localhost:5000/api';                      // Desenvolvimento - Local

export default API_URL;

// ✅ Configuração automática:
// - npm run dev → localhost:5000
// - npm run build → usa VITE_API_URL ou fallback Vercel
