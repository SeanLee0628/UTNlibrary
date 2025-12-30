FROM node:18-slim AS builder

# Install Python and pip
RUN apt-get update && apt-get install -y python3 python3-pip python3-venv

WORKDIR /app

COPY . .

# Create virtual environment and add to PATH
ENV PATH="/opt/venv/bin:$PATH"
RUN python3 -m venv /opt/venv

# Install dependencies in venv
RUN pip install --no-cache-dir -r backend/requirements.txt
RUN python -m prisma generate --schema=backend/schema.prisma

FROM python:3.9-slim

WORKDIR /app

COPY --from=builder /app /app
COPY --from=builder /opt/venv /opt/venv

# Enable venv in final stage
ENV PATH="/opt/venv/bin:$PATH"

CMD ["sh", "-c", "cd backend && uvicorn main:app --host 0.0.0.0 --port $PORT"]
