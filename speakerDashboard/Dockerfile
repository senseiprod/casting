FROM nginx:alpine

# Copy pre-built files from your local machine
COPY dist/speaker-dashboard /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
