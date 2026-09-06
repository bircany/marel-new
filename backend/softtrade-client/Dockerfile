FROM node:20-alpine

WORKDIR /app

# Bağımlılıkları önce kopyala (cache optimizasyonu)
COPY package.json package-lock.json* ./
RUN npm install

# Projeyi kopyala
COPY . .

EXPOSE 3000

# Dev mode
CMD ["npm", "run", "dev"]
