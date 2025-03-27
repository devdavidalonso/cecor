# Stage 1: Build
FROM node:18-alpine AS builder

WORKDIR /app

# Copiar package.json e instalar dependências
COPY package.json tsconfig.json angular.json ./
COPY tsconfig.app.json ./

# Instalar dependências
RUN npm install

# Copiar o restante do código
COPY . .

# Compilar o aplicativo
RUN npm run build

# Stage 2: Runtime
FROM nginx:alpine

# Remover o conteúdo padrão do Nginx
RUN rm -rf /usr/share/nginx/html/*

# Copiar os arquivos compilados - CORRIGIDO:
# Em vez de copiar para /usr/share/nginx/html/frontend/
# Copiamos diretamente para /usr/share/nginx/html/
COPY --from=builder /app/dist/frontend/ /usr/share/nginx/html/

# Copiar configuração do Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]