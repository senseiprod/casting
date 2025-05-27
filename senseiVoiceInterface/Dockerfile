FROM nginx:alpine

# Copy the built Angular app from dist folder
COPY ./dist/sensei-voice-client /usr/share/nginx/html

# Remove the default nginx configuration
RUN rm /etc/nginx/conf.d/default.conf

# Copy our custom nginx configuration
COPY ./nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
