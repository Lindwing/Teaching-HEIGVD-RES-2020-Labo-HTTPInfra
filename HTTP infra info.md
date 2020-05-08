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