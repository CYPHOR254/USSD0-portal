FROM node:16-alpine3.12 as builder

WORKDIR /app

COPY package*.json /app

RUN npm install --legacy-peer-deps
