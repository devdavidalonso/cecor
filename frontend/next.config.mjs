/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    output: 'standalone',
    swcMinify: true,
    // Adicione isso se precisar se conectar à sua API backend em outro container
    async rewrites() {
      return [
        {
          source: '/api/:path*',
          destination: 'http://backend:8080/:path*', // Ajuste para o nome do serviço e porta do seu backend
        },
      ];
    },
  };
  
  export default nextConfig;