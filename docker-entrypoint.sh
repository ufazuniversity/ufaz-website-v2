#!/bin/sh

set -xe; python manage.py migrate --noinput; gunicorn website.wsgi:application