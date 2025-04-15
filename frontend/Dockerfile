FROM node:23-alpine as builder
WORKDIR /opt/app
COPY . .
RUN tsc --build

FROM nginx:1.27.4-alpine
RUN rm -rf /usr/share/nginx/html/*
COPY --from=builder /opt/app/index.html /usr/share/nginx/html/
COPY --from=builder /opt/app/style.css /usr/share/nginx/html/
COPY --from=builder /opt/app/dist /usr/share/nginx/html/dist

# Можно также скопировать кастомный конфиг, если нужно
# COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]