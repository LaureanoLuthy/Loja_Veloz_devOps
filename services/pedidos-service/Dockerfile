# ----------------------------------------------------
# Estagio 1: Build & Dependencias (Builder)
# ----------------------------------------------------
FROM node:20-alpine AS builder

WORKDIR /usr/src/app

COPY package.json ./

# Instala apenas dependencias de producao de forma enxuta
RUN npm install --omit=dev && npm cache clean --force

# ----------------------------------------------------
# Estagio 2: Imagem Final de Execucao (Runtime Seguro)
# ----------------------------------------------------
FROM node:20-alpine

ENV NODE_ENV=production

WORKDIR /usr/src/app

# Copia dependencias do estagio builder e o codigo fonte
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY package.json ./
COPY server.js ./

# Seguranca: define permissao e roda como usuario comum 'node' (nao-root)
RUN chown -R node:node /usr/src/app
USER node

EXPOSE 3000

CMD ["node", "server.js"]