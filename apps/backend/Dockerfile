# Backend + the static storefront it serves, in one image.
#
# The build context is the REPOSITORY ROOT (see docker-compose.yml), because the
# server serves the storefront's HTML/CSS/JS as well as the API. Building from
# ./backend alone leaves the container with no site to serve.
FROM node:20-alpine
WORKDIR /app

COPY apps/backend/package.json ./
RUN npm install

COPY apps/backend/ ./
RUN npm run build
COPY apps/frontend/public ./public
COPY server ./server
COPY apps/server ./apps/server
RUN mkdir -p /server && cp -r ./server/* /server/ 2>/dev/null || true

ENV STATIC_ROOT=/app/public
EXPOSE 4000
CMD ["node","dist/main.js"]
