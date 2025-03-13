# frontend/Dockerfile
FROM node:20.18.3-alpine

WORKDIR /app

# Copiar package.json e package-lock.json
COPY package*.json ./

# Instalar dependências
RUN npm install

# Copiar o resto dos arquivos
COPY . .

# Configurar variável de ambiente para API
ENV NEXT_PUBLIC_API_URL=http://localhost:8080/api

# Construir a aplicação Next.js
RUN npm run build

EXPOSE 3000

# Iniciar o servidor em modo de produção
CMD ["npm", "run", "start"]