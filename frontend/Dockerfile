# syntax=docker/dockerfile:1
FROM node:22-alpine AS builder

LABEL maintainer="UrbanPulse Team"
LABEL description="UrbanPulse AI Frontend - Builder Stage"

# Vite inlines VITE_* vars into the bundle at BUILD time.
# Values come from the root .env via docker-compose build.args.
# Only non-secret, publishable values are passed as ARGs.
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_ANON_KEY
ARG VITE_API_URL

ENV VITE_SUPABASE_URL=$VITE_SUPABASE_URL \
    VITE_SUPABASE_ANON_KEY=$VITE_SUPABASE_ANON_KEY \
    VITE_API_URL=$VITE_API_URL

WORKDIR /app

COPY package.json package-lock.json ./
# NOTE: --ignore-scripts is intentionally REMOVED — esbuild's postinstall
# downloads the platform binary and is required for `vite build`.
RUN npm ci && \
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

CMD ["nginx", "-g", "daemon off;"]
