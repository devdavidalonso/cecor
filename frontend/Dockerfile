# Stage 1: Build
FROM node:18-alpine AS builder

WORKDIR /app

# Copiar package.json e instalar dependências
COPY package.json package-lock.json ./
RUN npm ci

# Copiar o restante do código
COPY . .

# Construir o aplicativo
RUN npm run build

# Stage 2: Runtime
FROM nginx:alpine

# Remover o conteúdo padrão do Nginx
RUN rm -rf /usr/share/nginx/html/*

# Copiar os arquivos compilados diretamente para o diretório raiz
COPY --from=builder /app/dist/frontend/ /usr/share/nginx/html/

# Copiar a configuração do Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]