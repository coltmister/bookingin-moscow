FROM python:3.11-slim

ENV PYTHONUNBUFFERED 1
ENV PYTHONDONTWRITEBYTECODE 1

WORKDIR /src
ADD ./etc/python/requirements.txt /src/

RUN apt-get update -y && apt-get install --no-install-recommends -y build-essential gcc libpq-dev gettext python3-dev libjpeg-dev zlib1g-dev gdal-bin

RUN pip install -r requirements.txt

