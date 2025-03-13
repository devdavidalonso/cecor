# frontend/Dockerfile
FROM node:20.18.3-alpine

WORKDIR /app

# Copiar package.json e package-lock.json
COPY package*.json ./

# Instalar dependências (adicionando --legacy-peer-deps pode ajudar com compatibilidade)
RUN npm install --legacy-peer-deps

# Instalar Next.js globalmente (opcional, mas pode ajudar)
RUN npm install -g next

# Copiar o resto dos arquivos
COPY . .

# Configurar variável de ambiente para API
ENV NEXT_PUBLIC_API_URL=http://localhost:8080/api

# Verifique se o Next.js está instalado corretamente
RUN npx next --version || npm list next

EXPOSE 3000

# Usar npx para garantir que o comando next seja encontrado
CMD ["npx", "next", "start", "-p", "3000", "-H", "0.0.0.0"]