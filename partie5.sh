docker kill $(docker ps -q)
docker container prune -f

docker run -d --name express res/express
docker run -d --name apache res/apache_php
docker run -e STATIC_APP=172.17.0.3:80 -e DYNAMIC_APP=172.17.0.2:3000 -p 8080:80 --name proxy res/apache_rp