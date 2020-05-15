# Labo HTTP Infra 

**Auteurs : Stéphane Bouyiatiotis et Rui Filipe Lopes Gouveia**

## step 1 : serveur HTTP static (apache)

Dans cette partie, nous devons créer un site static et pouvoir y accéder en utilisant docker. Pour cela nous allons créer un une image docker permettant ceci. Après nous irons chercher une template pour notre site que nous ajouterons.

Dans un premier temps nous créons un Dockerfile qui contiendra nos informations pour le builds. Après cela nous choisissions une image préconstruite pour notre site, ici apache 5.6.


Dans un second temps nous allons chercher une template via start boostrap, nous la modifions selon nos préférences, puis nous l'ajoutons dans notre dossier content et nous spécifions au Dockerfile où il devra être copié.

À la fin notre docker file contient ceci :

```
FROM php:5.6-apache

COPY content/ /var/www/html/
```

Nous construisons l'image avec la commande :
`docker build -t res/apache2_php <location_du_dockerfile>`
ou bien
`docker build -t res/apache2_php .`
si on se trouve dans le dossier contenant le docker.

Nous lançons le conteneur de notre docker avec :
`docker run -d -p 9090:80 res/apache_php`

Maintenant pour s'y connecter ils nous faut aller sur notre navigateur et entrer dans la barre de recherche l'adresse IP fournis via docker et y rajouter le port sélectionner, ici 9090.

## step 2 : Dynamic HTTP server with express.js

Dans cette partie, nous devons faire un serveur http dynamique avec node.js, on utilise express.js comme Framework pour node.js.

1) Nous commençons par créer un dockerfile, puis nous avons utilisé npm init.  Nous avons installé le module chancejs. Nous installons les dépendances pour express avec npm et après on fait un `docker build -t res/express_cities .`pour créer l'image. Pour l'executé on fait `docker run -p 9090:3000 res/express_cities`. Puis on se connecte sur le navigateur et il nous renvoie une liste de villes.

2) nous avons utilisé node.js 12.16 à la place de node.js 4.4. A la place des students, nous avons crée une liste de villes aléatoires avec chancejs.

3)  Nous utilisons node.js 12.16 et nous utilisons docker toolbox sur Windows

4)Vérifiez que docker est déjà démarré, puis allé dans le dossier du projet et là vous démarrez un terminal. A partir du terminal utilisez la commande `cd docker-images/express-image/`. A ce moment là, on utilise la commande `docker build -t res/express_cities .`, puis la commande `docker run -p 9090:3000 res/express_cities`. Dans votre navigateur mettez la barre d'adresse http://192.168.99.100:9090/ et là il affiche une liste de villes aléatoire.