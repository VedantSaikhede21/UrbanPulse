# syntax=docker/dockerfile:1
FROM node:22-alpine AS builder

LABEL maintainer="UrbanPulse Team"
LABEL description="UrbanPulse AI Frontend - Builder Stage"

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --ignore-scripts && \
    npm cache clean --force

COPY tsconfig.json tsconfig.node.json vite.config.ts postcss.config.js tailwind.config.js ./
COPY index.html ./
COPY public/ public/
COPY src/ src/

RUN npm run build

FROM nginx:alpine

LABEL maintainer="UrbanPulse Team"
LABEL description="UrbanPulse AI Frontend - Civic infrastructure management UI"
LABEL version="0.1.0"

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

RUN chown -R nginx:nginx /usr/share/nginx/html && \
    chmod -R 755 /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD wget --quiet --tries=1 --spider http://localhost/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
