FROM node:20-alpine AS frontend-build
WORKDIR /app/frontend
COPY frontend/package.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

FROM python:3.11-slim AS final
WORKDIR /app

RUN apt-get update && apt-get install -y nginx curl && rm -rf /var/lib/apt/lists/*

COPY backend/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

COPY backend/ ./backend/

COPY --from=frontend-build /app/frontend/dist /var/www/html

RUN echo 'server { \n\
  listen 80; \n\
  root /var/www/html; \n\
  index index.html; \n\
  location / { try_files $uri $uri/ /index.html; } \n\
  location /api/ { proxy_pass http://127.0.0.1:8000; proxy_set_header Host $host; } \n\
  location /ws/ { \n\
    proxy_pass http://127.0.0.1:8000; \n\
    proxy_http_version 1.1; \n\
    proxy_set_header Upgrade $http_upgrade; \n\
    proxy_set_header Connection "Upgrade"; \n\
  } \n\
}' > /etc/nginx/sites-available/default

COPY start.sh /start.sh
RUN chmod +x /start.sh

EXPOSE 80

CMD ["/start.sh"]
