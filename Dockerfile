FROM node:18-slim AS builder

# Install Python and pip
RUN apt-get update && apt-get install -y python3 python3-pip

WORKDIR /app

COPY . .

# Install dependencies and generate Prisma client
RUN python3 -m pip install -r backend/requirements.txt
RUN python3 -m prisma generate --schema=backend/schema.prisma

FROM python:3.9-slim

WORKDIR /app

COPY --from=builder /app /app

# Install dependencies in the final image as well
RUN pip install -r backend/requirements.txt

CMD ["sh", "-c", "cd backend && uvicorn main:app --host 0.0.0.0 --port $PORT"]
