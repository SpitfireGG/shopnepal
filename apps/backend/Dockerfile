# Backend + the static storefront it serves, in one image.
#
# The build context is the REPOSITORY ROOT (see docker-compose.yml), because the
# server serves the storefront's HTML/CSS/JS as well as the API. Building from
# ./backend alone leaves the container with no site to serve.
FROM node:20-alpine
WORKDIR /app

COPY backend/package.json ./
RUN npm install

COPY backend/ ./
RUN npm run build

# The storefront, served from STATIC_ROOT.
COPY index.html 404.html product.html cart.html category.html search.html \
     track.html wishlist.html invoice.html label.html dummy-pay.html \
     payment-success.html payment-failure.html /app/public/
COPY assets/ /app/public/assets/
COPY admin/ /app/public/admin/

ENV STATIC_ROOT=/app/public
EXPOSE 3000
CMD ["node","dist/main.js"]
