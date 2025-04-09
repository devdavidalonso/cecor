# Estágio 1: Compilação
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

# Estágio 2: Runtime
FROM nginx:alpine

# Remover o conteúdo padrão do Nginx
RUN rm -rf /usr/share/nginx/html/*

# Copiar os arquivos compilados para o diretório correto
COPY --from=builder /app/dist/frontend/ /usr/share/nginx/html/

# Copiar configuração do Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Adicionar backend ao hosts file (substitua 172.20.0.2 pelo IP correto)
# RUN echo "172.20.0.2 backend" >> /etc/hosts

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]