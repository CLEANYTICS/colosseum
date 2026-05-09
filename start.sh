#!/bin/bash
echo "Starting CLEANYTICS..."
cd /mnt/c/Users/49174/cleanytics_clean/api && uvicorn main:app --port 8000 &
PYTHON_PID=$!
cd /mnt/c/Users/49174/cleanytics_clean && npm run dev
kill $PYTHON_PID