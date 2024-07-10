FROM ubuntu:latest

RUN apt-get -y update && apt-get -y install nano && apt-get -y install nginx git

RUN git clone -b main https://github.com/elianoestevampuc/comportaio-frontend.git /usr/share/nginx/html/comporta.io/

COPY default /etc/nginx/sites-available/default

EXPOSE 80
EXPOSE 443

CMD ["/usr/sbin/nginx", "-g", "daemon off;"]