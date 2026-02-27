FROM python:3.13-slim
WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends curl ca-certificates  \
    && rm -rf /var/lib/apt/lists/*
ADD https://astral.sh/uv/install.sh /uv-installer.sh
RUN sh /uv-installer.sh && rm /uv-installer.sh
ENV PATH="/root/.local/bin/:$PATH"

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PYTHONPATH="${PYTHONPATH}:/app/src" \
    PATH="/app/.venv/bin:$PATH"


COPY pyproject.toml uv.lock ./

RUN sed -i 's/index = "pytorch-cuda"/index = "pytorch-cpu"/g' pyproject.toml && \
    uv lock --upgrade-package torch --upgrade-package torchvision && \
    uv sync --frozen --no-install-project --no-dev --group pytorch

COPY src ./src
COPY models ./models

RUN useradd -m appuser && chown -R appuser /app
USER appuser

EXPOSE 8000

CMD ["uvicorn", "src.skin_disease_recognition.serving.app:app", "--host", "0.0.0.0", "--port", "8000"]