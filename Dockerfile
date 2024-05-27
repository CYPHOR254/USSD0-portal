FROM devops-registry.ekenya.co.ke/configurable-ussd/configurable-ussd-portal-builder:latest as builder

COPY . /app

RUN npm run build --prod


FROM nginx:1.17.10-alpine

EXPOSE 80

COPY --from=builder /app/dist/  /usr/share/nginx/html
