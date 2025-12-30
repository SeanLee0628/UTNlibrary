FROM python:3.11-slim

# Install system dependencies
RUN apt-get update && apt-get install -y openssl

WORKDIR /app

COPY . .

# Install dependencies directly to system to avoid path issues
RUN pip install --no-cache-dir -r backend/requirements.txt
RUN python -m prisma generate --schema=backend/schema.prisma

# Set working directory to backend for execution
WORKDIR /app/backend

CMD ["python", "main.py"]
