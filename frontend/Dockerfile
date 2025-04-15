FROM node:23-alpine as builder
WORKDIR /opt/app
COPY *.json .
RUN npm install
COPY . .
RUN npm run build

FROM nginx:1.27.4-alpine
RUN rm -rf /usr/share/nginx/html/*
COPY --from=builder /opt/app/static /usr/share/nginx/html/static
COPY --from=builder /opt/app/css /usr/share/nginx/html/css
COPY --from=builder /opt/app/akronym/styles /usr/share/nginx/html/akronym/styles
COPY --from=builder /opt/app/js /usr/share/nginx/html/js
COPY --from=builder /opt/app/index.html /usr/share/nginx/html/

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]