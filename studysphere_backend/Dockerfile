# Multi-stage / Production Dockerfile for StudySphere AI Django Backend

FROM python:3.11-slim

# Prevent Python from writing .pyc files & enable unbuffered stdout/stderr logging
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PORT=8000

# Set working directory
WORKDIR /app

# Install system build dependencies needed for Pillow, C extensions, and PostgreSQL
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    gcc \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install Python requirements
COPY requirements.txt /app/
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Copy backend source code
COPY . /app/

# Collect static files during image build
RUN python manage.py collectstatic --noinput || true

# Expose container port
EXPOSE 8000

# Run database migrations then start WSGI application using Gunicorn dynamically bound to $PORT
CMD sh -c "python manage.py migrate --noinput && gunicorn --bind 0.0.0.0:${PORT:-8000} --workers 2 --timeout 120 config.wsgi:application"
