FROM node:19.3.0-alpine as node

COPY . /app

WORKDIR /app/jstools

# Install npm packages
RUN npm install

RUN npm run build
RUN rm -rf node_modules

FROM python:3.11.1-slim-bullseye as python

RUN useradd wagtail

WORKDIR /app

EXPOSE 8000

RUN apt-get update --yes --quiet && apt-get install --yes --quiet --no-install-recommends \
    build-essential \
    libpq-dev \
    libjpeg62-turbo-dev \
    zlib1g-dev \
    libwebp-dev


ENV POETRY_HOME=/opt/poetry
ENV POETRY_VIRTUALENVS_IN_PROJECT=true
ENV POETRY_INSTALLER_MAX_WORKERS=10
ENV PATH="$POETRY_HOME/bin:$PATH"
RUN python -c 'from urllib.request import urlopen; print(urlopen("https://install.python-poetry.org").read().decode())' | python -
COPY pyproject.toml poetry.lock ./
RUN poetry install --no-interaction --no-ansi -vvv

## Install the application server.
RUN .venv/bin/pip install "gunicorn==20.1.0"

# Set environment variables.
# 1. Force Python stdout and stderr streams to be unbuffered.
# 2. Set PORT variable that is used by Gunicorn. This should match "EXPOSE"
#    command.
ENV PYTHONUNBUFFERED=1 \
    PORT=8000

# Set this directory to be owned by the "wagtail" user. This Wagtail project
# uses SQLite, the folder needs to be owned by the user that
# will be writing to the database file.
RUN chown wagtail:wagtail /app

# Copy the source code of the project into the container.
COPY --chown=wagtail:wagtail --from=node /app .

ENV PATH=".venv/bin:$PATH"

USER wagtail

# Collect static files.
RUN python manage.py collectstatic --noinput --clear

ENTRYPOINT ["./docker-entrypoint.sh"]

