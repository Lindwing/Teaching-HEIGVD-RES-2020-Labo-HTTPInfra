# Labo HTTP Infra 

## step 1 : serveur HTTP static (apache)

Dans ette partie nous devons créer un site static et pourvoir y accèder en utilisant docker. Pour cela nous allons créer un une image docker permettant ceci. Après nous irons chercher une template pour notre site que nous ajouterons.

Dans un premier temps nous créons un Dockerfile qui contiendra nos informations pour le builds. Après cela nous choissions une image précoustruite pour notre site, ici apache 5.6.


Dans un second temps nous allons chercher une template via start boostrap, nous la modifions selon nos préférences, puis nous l'ajoutons dans notre dossier content et nous spécifions au Dockerfile où il devra être copié.

À la fin notre docker file contient ceci :

```
FROM php:5.6-apache

COPY content/ /var/www/html/
```

Nous consturisons l'image avec la commande :
`docker build -t res/apache2_php <location_du_dockerfile>`
ou bien
`docker build -t res/apache2_php .`
si on se trouve dans le dossier contenant le docker.

Nous lançons le conteneur de notre docker avec :
`docker run -d -p 9090:80 res/apache_php`

Maintenant pour s'y connecter ils nous faut aller sur notre navigateur et entrer dans la barre de recherche l'adresse IP fournis via docker et y rajouter le port sélectionner, ici 9090.

## step 3 : reverse proxy apache static

Dans cette partie nous allons réaliser un serveur proxy pour docker.

Dans un premier temps il faut créer un docker file contenant les instructions suivantes:
```
FROM php:5.6-apache

COPY conf/ /etc/apache2

RUN a2enmod proxy proxy_http
RUN a2ensite 000-* 001-*
```

Les deux dernières lignes permettent d'activer les modules pour le bon fonctionnement de notre proxy.

Le dossier conf, qui est copier, lui contiendra nos 2 fichier de configurations qui sont, 000-default.conf et 001-reverse-proxy.conf qui permettra de rediriger l'utilisateur.

Contenue du 000-default.conf :
```
<VirtualHost *:80>
</VirtualHost>
```

et pour 001-reverse-proxy.conf:
```
<Virtualhost *:80>
	ServerName labo.res.ch


	ProxyPass "/api/students/" "http://172.17.0.3:3000/"
	ProxyPassReverse "/api/students/" "http://172.17.0.3:3000/"

	ProxyPass "/" "http://172.17.0.2:80/"
	ProxyPassReverse "/" "http://172.17.0.2:80/"

</VirtualHost>
```

Le port d'entrée 80 est pris comme port d'entrée à l'entrée du container, qu'il reste à associer au 8080 qui permet de communiquer avec l'extérieur. Le nom de domaine utilisé pour 
appeler le serveur proxy est "labo.res.ch". Pour le bon fonctionnement il faut enregistrer l'ip fournis par docker et le lier au nom du server dans le fichier host.
Les 2 paires de directives gèrent chacune la redirection de requêtes au serveur dynamique express (1ere paire), ainsi que la redirection au 
serveur statique (2e paire). Les IP pour chaque serveur sont statiquement fixées donc il faut faire attention à l'ordre dans lequel on lance nos containers.

## step 5 : reverse proxy et ip dynamique

Ici nous allons régler notre problème lié au fait que nous devons lancer les docker dans un certaine ordre pour nos fichier de configurations. En effet si pour une raison ou une autre
nos adresses de containers n'était pas identique à celle de notre fichier de configuration, 001-reverse-proxy.conf, alors cela ne fonctionnait pas.

Pour corriger ce problème nous allons faire que nous pouvons attribuer dynamiquement les adresses à notre proxy. Pour ce faire nous allons réécrire notre fichier 001-reverse-proxy.conf.
Pour ce faire nous allons créer un fichier config-template.php qui prendra les adresses ip et le port de nos containers.
Nous créons un fichier apache2-foreground qui s'occupera de remplacer notre fichier 001-reverse-proxy.conf.

Ensuite nous modifions notre docker file de cette manière :
Dockerfile :
```
FROM php:5.6-apache

RUN apt-get update && \
	apt-get install -y vim

COPY apache2-foreground /usr/local/bin/
COPY templates /var/apache2/templates

COPY conf/ /etc/apache2

RUN a2enmod proxy proxy_http
RUN a2ensite 000-* 001-*
```

maintenant en créant notre conainer nous pouvons attribuer les adresses de cette manière:
```docker run -e ENV_VAR1=adresseIP:Port -e ENV_VAR1=adresseIP:Port image_docker```

le nom des variables d'environnement sont décidé lors de la création de notre ficher config-templace.
Les deux adresse ip elles sont celle de nos containers.
image_docker est l'image de notre reverse proxy.

Exemple de commande:
```docker run -e STATIC_APP=172.17.0.3:80 -e DYNAMIC_APP=172.17.0.2:3000 res/apache_rp```

#Step Bonus

## Bonus 1 : Management UI

Le but est de pouvoir manager notre infrstructure web avec une interface graphique.

Pour cela nous allons utilisé ```Portainer.io```

Portainer permet de gérer docker à travers une interface web. Un autre avantage il permet de se lancé et être utilisé à travers docker sans besoin de l'installer directement sur notre machine.
Portainer expose le port 9000 et va écouter le socket ```/var/run/docker.sock``` ainsi il aura accès aux diverse informations lié à docker ( comme les images, les container lancé etc...) et permettra de gérer directement tous les containers.

Pour plus de détail la vidéos : ```https://www.youtube.com/watch?v=GNG6PDFxQyQ```

Pour installer et lancer ```portainer.io``` avec docker il faut faire cette commande:

```docker run -it -d --name portainer -v /var/run/docker.sock:/var/run/docker.sock -p 9000:9000 portainer/portainer```