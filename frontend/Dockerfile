# frontend/Dockerfile
FROM node:20.18.3

WORKDIR /app

# Copiar package.json e package-lock.json
COPY package*.json ./

# Instalar dependências
RUN npm install

# Copiar o resto dos arquivos
COPY . .

# Configurar variável de ambiente para API
ENV REACT_APP_API_URL=http://localhost:8080

EXPOSE 3000

CMD ["npm", "start"]