#!/bin/sh
set -e
uvicorn backend.main:app --host 0.0.0.0 --port 8000 &
nginx -g "daemon off;"
