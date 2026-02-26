FROM node:20-slim AS frontend-builder
WORKDIR /frontend

COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:stable-alpine AS nginx-builder
WORKDIR /app

COPY --from=frontend-builder /frontend/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/templates/default.conf.template