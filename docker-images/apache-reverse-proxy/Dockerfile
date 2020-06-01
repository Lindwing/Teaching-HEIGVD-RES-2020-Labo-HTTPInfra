FROM php:5.6-apache

RUN apt-get update && apt-get install -y vim && apt-get install dos2unix

COPY apache2-foreground /usr/local/bin/
RUN cd /usr/local/bin/ && dos2unix apache2-foreground
COPY templates /var/apache2/templates

COPY conf/ /etc/apache2

RUN a2enmod proxy proxy_http
RUN a2enmod proxy_balancer lbmethod_byrequests
RUN a2ensite 000-* 001-*