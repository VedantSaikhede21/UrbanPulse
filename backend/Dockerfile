# syntax=docker/dockerfile:1
FROM python:3.12-slim AS builder

LABEL maintainer="UrbanPulse Team"
LABEL description="UrbanPulse AI Backend - Builder Stage"

RUN apt-get update && apt-get install -y --no-install-recommends \
    libpq-dev \
    gcc \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

FROM python:3.12-slim

LABEL maintainer="UrbanPulse Team"
LABEL description="UrbanPulse AI Backend - Multi-agent civic infrastructure triage platform"
LABEL version="0.2.0"

RUN apt-get update && apt-get install -y --no-install-recommends \
    libpq-dev \
    ca-certificates \
    curl \
    && rm -rf /var/lib/apt/lists/* \
    && groupadd -r urbanpulse \
    && useradd -r -g urbanpulse -d /app -s /sbin/nologin urbanpulse

WORKDIR /app

COPY --from=builder /usr/local/lib/python3.12/site-packages /usr/local/lib/python3.12/site-packages
COPY --from=builder /usr/local/bin /usr/local/bin

COPY --chown=urbanpulse:urbanpulse . .

# Uploads dir must exist and be writable by the non-root user BEFORE the
# named volume is mounted, otherwise the volume is created root-owned and
# file uploads fail at runtime.
RUN mkdir -p /app/uploads && chown -R urbanpulse:urbanpulse /app/uploads

COPY entrypoint.sh /entrypoint.sh
# CRLF safety net for checkouts made on Windows.
RUN sed -i 's/\r$//' /entrypoint.sh \
    && chmod +x /entrypoint.sh

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1

RUN python -c "import compileall; compileall.compile_dir('/app', force=True, quiet=1)" 2>/dev/null || true

EXPOSE 8000

USER urbanpulse

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
    CMD curl -sf http://localhost:8000/api/health || exit 1

ENTRYPOINT ["/entrypoint.sh"]
