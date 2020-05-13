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