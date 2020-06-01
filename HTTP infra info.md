# Labo HTTP Infra 

## Step 1 : serveur HTTP static (apache)

Dans cette partie nous devons créer un site static et pourvoir y accéder en utilisant docker. Pour cela nous allons créer un une image docker permettant ceci. Après nous irons chercher une template pour notre site que nous ajouterons.

Dans un premier temps nous créons un Dockerfile qui contiendra nos informations pour le builds. Après cela nous choisissons une image préconstruite pour notre site, ici apache 5.6.


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

1. Nous commençons par créer un dockerfile, puis nous avons utilisé npm  init.  Nous avons installé le module chancejs. Nous installons les   dépendances pour express avec npm et après on fait un `docker build -t res/express_cities .`pour créer l'image. Pour l'éxecuté on fait `docker run -p 9090:3000 res/express_cities`. Puis on se connecte sur le navigateur et il nous renvoie une liste de villes.
2. nous avons utilisé node.js 12.16 à la place de node.js 4.4. A la   place des students, nous avons crée une liste de villes aléatoires avec  chancejs.
3. Nous utilisons node.js 12.16 et nous utilisons docker toolbox sur Windows
4. Vérifiez que docker est déjà démarré, puis allé dans le dossier du   projet et là vous démarrez un terminal. A partir du terminal utilisez la commande `cd docker-images/express-image/`. A ce moment là, on utilise la commande `docker build -t res/express_cities .`, puis la commande `docker run -p 9090:3000 res/express_cities`. Dans votre navigateur mettez la barre d'adresse http://192.168.99.100:9090/ et là il affiche une liste de villes aléatoire.

## Step 3 : reverse proxy apache static

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

## Step 4 : AJAX requests with JQuery

Dans cette partie, nous devons utiliser la librairie JavaScript   JQuery pour envoyer des requêtes (AJAX) vers le serveur dynamique   (express.js) et pour mettre à jour la page web (DOM).

1. Nous commençons par modifier les dockerfile pour installer vim, puis  nous créons un fichier javascript cities.js. Nous changeons la class   container de index.html pour afficher le nom des villes généré pas le   script.
2. nous avons utilisé utilisé notre script qui génère des villes à la place  de celui qui génère des étudiants
3. Nous avons changé la class container dans l'index.html ce qui fait qu'il y plusieurs endroit ou le nom des villes apparait.
4. Vérifiez que docker est déjà démarré, puis allé dans le dossier du   projet et là vous démarrez un terminal. A partir du terminal utilisez la commande `cd docker-images/express-image/`. A ce moment là, on utilise la commande `docker build -t res/express_cities .`, puis la commande `docker run -p 9090:3000 res/express_cities`. Dans votre navigateur mettez la barre d'adresse http://192.168.99.100:9090/ et là il affiche une liste de villes aléatoire.

## Step 5 : reverse proxy et ip dynamique

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

maintenant en créant notre container nous pouvons attribuer les adresses de cette manière:
```docker run -e ENV_VAR1=adresseIP:Port -e ENV_VAR1=adresseIP:Port image_docker```

le nom des variables d'environnement sont décidé lors de la création de notre ficher config-templace.
Les deux adresse ip elles sont celle de nos containers.
image_docker est l'image de notre reverse proxy.

Exemple de commande:
```docker run -e STATIC_APP=172.17.0.3:80 -e DYNAMIC_APP=172.17.0.2:3000 res/apache_rp```

# Step Bonus

## Bonus 1 : Management UI

Le but est de pouvoir manager notre infrastructure web avec une interface graphique.

Pour cela nous allons utilisé ```Portainer.io```

Portainer permet de gérer docker à travers une interface web. Il permet de se lancé et être utilisé à travers docker sans besoin de l'installer directement sur notre machine.
Portainer expose le port 9000 et va écouter le socket ```/var/run/docker.sock``` ainsi il aura accès aux diverse informations lié à docker ( comme les images, les container lancé etc...) et permettra de gérer directement tous les containers.

Pour plus de détail voir la vidéos : ```https://www.youtube.com/watch?v=GNG6PDFxQyQ```

Pour installer et lancer ```portainer.io``` avec docker il faut faire cette commande:

```docker run -it -d --name portainer -v /var/run/docker.sock:/var/run/docker.sock -p 9000:9000 portainer/portainer```

<<<<<<< HEAD
Après pour y accéder il suffit de placer l'ip de votre docker (généralement ```192.168.99.100```) suivit du port, ici 9000.

## Bonus 2 : Load Balancing

Le but est de répartir la charge de travail entre plusieurs serveurs, nous avons donc modifié le reverse proxy.

Nous avons modifier le dockerfile pour rajouter la gestion du load balancing avec la ligne `RUN a2enmod proxy_balancer lbmethod_byrequests`. Nous avons aussi changé le fichier php pour qu'il gère 6 serveurs (trois statiques et trois dynamiques) qui vont ce rendre la charge de travail.

Le fichier config-template contient ceci:

` <?php
	$dynamic_app1 = getenv('DYNAMIC_APP1');
	$dynamic_app2 = getenv('DYNAMIC_APP2');
	$dynamic_app3 = getenv('DYNAMIC_APP3');
	$static_app1 = getenv('STATIC_APP1');
	$static_app2 = getenv('STATIC_APP2');
	$static_app3 = getenv('STATIC_APP3');
?>
<VirtualHost *:80>
	ProxyRequests off
	ServerName labo.res.ch`
	

	<Proxy balancer://express-cluster>
		BalancerMember 'http://<?php print "$dynamic_app1"?>'
		BalancerMember 'http://<?php print "$dynamic_app2"?>'
		BalancerMember 'http://<?php print "$dynamic_app3"?>'
	</Proxy>


	ProxyPass '/api/students/' 'balancer://express-cluster/'
	ProxyPassReverse '/api/students/' 'balancer://express-cluster/'


	<Proxy balancer://static-cluster>
		BalancerMember 'http://<?php print "$static_app1"?>'
		BalancerMember 'http://<?php print "$static_app1"?>'
		BalancerMember 'http://<?php print "$static_app1"?>'
	</Proxy>
	
	ProxyPass  '/' 'balancer://static-cluster/'
	ProxyPassReverse '/' 'balancer://static-cluster/'
`</VirtualHost>`

Test: pour tester le load balancing, nous avons fait simple nous lançons 3 paires de serveurs, puis nous arrêtons 2 paires et le site fonctionne toujours.
=======
Après pour y accèder il suffit de placer l'ip de votre docker (générallement ```192.168.99.100```) suivit du port, ici 9000.
>>>>>>> dbf93a3f521004714c3d78c16f26ba5ed7d1aff7
