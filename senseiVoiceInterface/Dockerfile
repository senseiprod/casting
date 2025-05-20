FROM nginx:alpine
# Use the correct relative path
COPY ./dist/sensei-voice-client /usr/share/nginx/html
COPY ./nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
