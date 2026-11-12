# Stage 1: Build React frontend
FROM node:20-alpine AS frontend-build
WORKDIR /app/frontend
COPY frontend/package.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

# Stage 2: Final image with nginx + FastAPI
FROM python:3.11-slim
RUN apt-get update && apt-get install -y nginx curl && rm -rf /var/lib/apt/lists/*

WORKDIR /app
RUN pip install --no-cache-dir fastapi "uvicorn[standard]" pydantic pydantic-settings websockets redis httpx pandas numpy yfinance feedparser scikit-learn python-jose passlib python-multipart

COPY backend/ /app/backend/
COPY --from=frontend-build /app/frontend/dist /var/www/html/

RUN printf 'server {\n    listen 80;\n    server_name _;\n    root /var/www/html;\n    index index.html;\n    location /api/ {\n        proxy_pass http://127.0.0.1:8000/api/;\n        proxy_set_header Host $host;\n        proxy_set_header X-Real-IP $remote_addr;\n    }\n    location /ws/ {\n        proxy_pass http://127.0.0.1:8000/ws/;\n        proxy_http_version 1.1;\n        proxy_set_header Upgrade $http_upgrade;\n        proxy_set_header Connection "upgrade";\n        proxy_set_header Host $host;\n    }\n    location / {\n        try_files $uri $uri/ /index.html;\n    }\n}\n' > /etc/nginx/sites-available/default

COPY start.sh /start.sh
RUN chmod +x /start.sh

EXPOSE 80

CMD ["/start.sh"]
