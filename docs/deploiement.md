# Déploiement

## Menu du jour

```
9h-10h : échauffement
  - Slides d'introduction
  - Démarrer les machines

10h-12h : déploiement
  - Clone, installations, lancement
  - Postgres, Node

13h-15h : plus loin ?
  - Deamon PM2
  - Reverse Proxy Nginx
  - (bonus) SSH : `scp` et `ftps`
```


## Échauffement

- Démarrez vos **VM Téléporteur** car vous aurez besoin du **VPS**.

- Acceptez le ochallenge [S08-okanban-monorepo-RED](https://kourou.oclock.io/o-challenge/?ref=Ty1jbG9jay1NdWZmaW4vUzA4LW9rYW5iYW4tbW9ub3JlcG8tUkVELWVuem9jbG9ja3xPLWNsb2NrLU11ZmZpbnxTMDgtb2thbmJhbi1tb25vcmVwby1SRUR8MjAyNC0wMy0xNVQwOTowMHw=)
  - pas besoin de le cloner.

- Se connecter à **Kourou** depuis sa **VM Téléporteur**, afin de se rendre sur la page suivante : 
  - [Gestion Server Cloud](https://kourou.oclock.io/ressources/vm-cloud/)
  - Et cliquer sur `Créer la VM` et/ou `Démarrer la VM` : il faut patienter quelques minutes !

- Rejoindre le [LiveShare](https://prod.liveshare.vsengsaas.visualstudio.com/join?54C48C71C7629AEF363AE61FB1A2C456CC08).


## Introduction au métier de Sysadmin

### Serveurs 

On distingue : 
- **Serveurs Physique** : 
  - la machine en face de vous
  - les racks dans des datacenter pour héberger Slippers
  - un Rasberry PI

- **Serveurs Applicatifs** : 
  - Live serveur
  - Node avec `http` ou `Express`
  - NGINX
  - `Postgres` (serveur de base de données)

[Vidéo de visite d'un datacenter](https://www.youtube.com/watch?v=rO6bXt7d2L8) (9min)


### Solutions d'hébergement

#### Solutions `On-Premise`

- Acheter soit même son serveur physique "à la maison" et gérer son infrastructure (interne, alimentation, ...)
  - solution _"le serveur dans le placard sous l'escalier_"

Avantages : 
- **coût** : 1 seul investissement jusqu'à ce que le serveur ne suffisent plus
- **contrôle** : controle total sur la machine et les applications qu'on met dessus

Inconvénients : 
- **expertise** : c'est plus de contrainte technique
- **infrastructure** : c'est à nous d'assurer constamment l'infra (internet, alimentation, refroidissement, backup des données...)
- **coût** : on gère nous même le remplacement des serveurs "morts", l'électricité, ...
- **scalabilité** : notre serveur, au bout d'un certains nombre d'utilisateur, ne tiendra peut être plus la charge demandé !

Ex : une pré-prod en ligne d'une application peut-être héberger de cette manière. 

#### Solutions `Cloud`

**CLOUD** = c'est l'ordinateur de quelqu'un d'autre.

Généralement, de la **location de machine** (ou machine virtuelle) sur des serveurs dans des datacenter.

Fournisseurs Cloud les plus populaires :
- `AWS` (Amazon Web Service)
- `MA` (Microsoft Azure)
- `GCP` (Google Cloud Platforme)
- `OVH` (🇫🇷)
- `Hostinger`
- `Digital Ocean`
- `o2switch`

Avantages :
- **infra** : rien à gérer côté infra et hardware : l'accès à la machine est assuré à 99.9% du temps (**UPTIME**)
- **scale** : possibilité de "upgrade" son serveur (soit un plus gros, soit plusieurs), y compris **dynamiquement** selon les demandes utilisantes

Inconvénients : 
- **coût** : on loue (mais ça peut être un avantage selon les cas) et le coût dépend de l'utilisation
- **confiance** : certaines entreprises refusent que leurs données soient héberger sur des serveurs tiers.

[AWS en chanson](https://www.youtube.com/watch?v=BtJAsvJOlhM)

### Offres Cloud

- **Serveur dédié physique** : 
  - _on loue un rack complet dans un datacenter_
  - ça coûte cher !

Note : on a acheté l'immeuble

- **Serveur dédié virtuel** 
  - **VPS = Virtual Private Server**
  - on loue une `VM` sur un rack dans un datacenter
    - (parfois, cette VM est répartie sur plusieurs machines)
  - avantages : 
    - moins cher car on n'a qu'une partie du serveur physique
    - généralement, on a les accès `SSH` : on peut accéder à la machine comme si elle était devant nous.
    - généralement, on a les accès `root` sur cette machine : on y installe ce qu'on veut.

Note : on a acheté un appart dans l'immeuble

- **Serveur mutualisé** :
  - un peu comme le VPS, mais sans les accès SSH ni root
  - par exemple, le SGBD est déjà installé et le serveur "Apache" (PHP) est déjà installé : 
    - on y a plus qu'à "glisser déposer" nos fichiers statiques, nos fichiers PHP...
  - inconvénients : moins de contrôle
  - avantages : moins cher ! ça peut suffire pour un site vitrine

Note : on est en colloc dans un appart

### `...as a Service`

- `SaaS` : Software as a Service
  - ex : Google Drive, Trello, Slippers, Spotify, Github, SAP, ~ site web
  - l'hébergeur fourni (loue) le **software** herbégé
  - dans beaucoup de cas, le métier de dev c'est de développer des SAAS !

- `PaaS` : Platform as a Server
  - ex : Github Page, Firebase, Vercell, Heroku, AWS S3
  - l'hébergeur nous fourni des **serveurs applicatifs** prêt à l'emploi 
    - (plutôt à destination des entreprise qui vont héberger leurs SASS)
  - inconvénient : pas d'accès en root à 100%
  - avantages : rapide et facile

- `IaaS` : Infrastructure as a Server
  - ex : `AWS EC2`  / un VPS
  - l'hébergeur nous fourni l'infrastructure (machine vide) qu'ils gèrent.
  - avantage : accès à 100% à notre machine (vituelle) !
  - inconvénient : on gère nous même les serveurs applicatifs desssu (ex : installer Postgres)

- `DBaaS` : Database as a Service
  - ex : MongoAtlas, Neon, ElephantSQL
  - sous catégorie du PaaS


### Devops

**Et nous aujourd'hui ? ==> on loue un VPS (serveur dédié virtuel - IaaS) sur lequel on va déployer Okanban.**

**DevOps** = une mouvance qui vise à réconcilier deux métiers a priori antagonistes : 
- `dev` / développeur : développer des fonctions logicielles
- `ops` / opération / sysadmin : assurer le bon fonctionnement des serveurs en productions


### Les 7 travaux du `sysadmin`

- Choisir le bon type d'hébergement
  - selon le nombre d'utilisateur
  - selon le prix
  - selon des demandes client particulières

- Installer le serveur
  - installer Linux
  - gérer la connexion internet si c'est pas fait 

- Configurer le serveur
  - installer Node
  - installer Postgres
  - mettre à jour le système d'exploitation

- Sécuriser le serveur
  - protéger le serveur contre les attaques (DDOS, ...)
  - suivre les bonnes recommandations de sécurités (ouverture des ports...)

- Mettre en production le site
  - Déploiement

- Maintenir et surveiller le serveur
  - `uptime 100%` c'est l'objectif
  - vérifier les logs pour s'assurer qu'il n'y a pas d'erreurs

- Faire évoluer et migrer le serveur
  - si la demande augmente, il faudra peut être : acheter un nouveau RACK, changer d'hébergement.


## Rappel : pour lancer notre projet en local 

- `npm i`
- `cp .env.example .env`
- `npm run build`
- Créer la BDD
- `npm run db:reset` (`npm run db:create`)
- `npm run start`


## Plan d'attaque du déploiement 

- [x] Commander un VPS `Linux Ubuntu` sur AWS (via Kourou)
- [x] Se connecter à ce VPS (via SSH)

- [x] Créer et associer une clé SSH à Github
- [x] Cloner le dépôt okanban

- [x] Installer Postgresql (via APT)
- [x] Installer Node (via NVM) et NPM

- [x] Créer la BDD
  - [x] Créer l'utilisateur
  - [x] Créer la BDD

- [x] Déploiement
  - [x] Installer les dépendances (`npm i`)
  - [x] Gérer les variables d'environnement (`.env`)
  - [x] Créer les tables (`db:create`)
  - [x] Créer le build client (`build`)
  - [x] Démarrer l'applicatin (`start`)

- [x] Bonus
  - [x] Faire tourner okanban en tâche de fond (`PM2`)
  - [x] Lancer Okanban au démarrage du système (`PM2`)
  - [x] Se passer du port 3000 via un reverse proxy (`NGINX`)

# Déploiement

## Vocabulaire

- `VM Téléporteur` / `Téléporteur` = la machine de dev habituelle (sur votre local ou VM Cloud pour les Mac)
- `VM Kourou` / `VM Cloud` / `VM AWS` / `VPS` = la machine VPS dont les accès sont précisés sur la [page Kourou](https://kourou.oclock.io/ressources/vm-cloud/)

## Se connecter en SSH à cette machine

- Vérifier que cette machine tourne : 
  - Rendez-vous : https://kourou.oclock.io/ressources/vm-cloud/
  - Vérifier que la machine est `démarée` 

- ✅ Copier l'adresse SSH de cette machine : 
  - `ssh student@enzoclock-server.eddi.cloud`
  - (ATTENTION, PAS : ssh://student@enzoclock-server.eddi.cloud)

- ✅ Ouvrir un **terminal** dans votre **VM Téléporteur**
  - note : je crois que ça marche également depuis le terminal de votre hôte depuis quelque temps...

- ✅ Rentrer la commande SSH :
  - `Are you sure you want to continue connecting (yes/no/[fingerprint])?`
  - ✅ répondre `yes`

- Vérification
  - le prompt change et deviens vert : `student@host-server`

**🎉 Bienvenue sur votre VM AWS 🎉**

- Pour entrer et sortir : 
  - `exit`
  - `ssh student@enzoclock-server.eddi.cloud`


## Gérer un système Linux (Ubuntu)

```bash
# Info système

uname -a # info système
5.19.0-1029-aws # version du kernel (coeur)
whoami # nom de l'utilisateur courant

# Note : l'utilisateur "super user" s'appelle root et pour lancer un commande en sa personne on peut utiliser `sudo`

lsb_release -a      # version d'Ubuntu
hostname            # nom de l'hôte
df -h               # espace disque
free -h             # mémoire (RAM)

# ✅ Mettre à jour la liste des packages Linux
sudo apt update # mot de passe : par dessus les nuages

# (❌ Ne pas faire) Mettre à jour les packages déjà installés
sudo apt upgrade    # ❌ ne pas faire
```

## Créer une clé SSH (sur le VPS) et la déclarer auprès de Github

> Dans le but de pouvoir cloner notre dépôt

> [Lien vers la documentation](https://docs.github.com/en/authentication/connecting-to-github-with-ssh/generating-a-new-ssh-key-and-adding-it-to-the-ssh-agent)

```bash
# S'assurer d'être dans le répertoire utilisateur
pwd
ls -a
cd ~ 

# Créer une paire de clé SSH (privée / publique)
ssh-keygen -t ed25519 -C "votre_email_github" # valider 3 fois avec la toucher ENTRÉE (laisser les champs vide)

# Vérifier la présence des clées générées
ls ~/.ssh

# Démarrer l'agent SSH
eval "$(ssh-agent -s)"

# Ajouter la clé privée à l'agent SSH
ssh-add ~/.ssh/id_ed25519

# Afficher la clé publique
cat ~/.ssh/id_ed25519.pub # la copier (la ligne entière !)
```

La clé publique ressemble à ça. Tout copier, y compris `ssh-ed...` et le mail au bout

> ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIGIbIcRWxQbgF9XCb35Eir79Fg8repdgUIHiUXSDj4N3 enzo.testa@oclock.io


- Se rendre dans son monodépôt accepté ce matin, à son **nom**, dans les settings
  - `https://github.com/O-clock-Muffin/S08-okanban-monorepo-RED-pseudoGithub/settings/keys`
  - `Settings` > `Deploy Key`

- Bouton `Add deploy key` :
  - **Titre** : VM Kourou (par exemple)
  - **Key** : copier la clé PUBLIQUE complète
  - **Allow write access** : NON (car on ne code pas directement depuis la production)

- Cloner le dépôt depuis la VM AWS : 
  - `cd ~`
  - `git clone git@github.com:O-clock-Muffin/S08-okanban-monorepo-RED-pseudo.git`
  - si besoin (pour "faire confiance à Github"), valider avec `yes`

- Vérification : 
  - `ls` : le dépôt est bien là !


## Installer Postgres

```bash
# Vérifier que Postgres n'est pas déjà installé et lancé
sudo systemctl status postgresql # confirmation : Unit postgresql.service could not be found. #mdp : par dessus les nuages pour TOUTES les commandes sudo

# Installer Postgres
sudo apt install -y postgresql  # l'option '-y' permet de confirmer automatiquement

# Vérifier que Postgres est bien installé
sudo systemctl status postgresql # confirmation : doit être 'active' # quitter cette commande avec 'q'
```


- `APT` = `Advanced Packaging Tool` = gestionnaire de packets pour LInux
- `Homebrew` = pour MacOS
- `windget` / `chocolatey` = pour Windows
- `NPM` = pour Node

## En cas de proposition d'update Kernel

```bash
# ❗️ En cas de prompt à propos à propos d'un update Kernel (Version 5 -> Version 6)

# - "Newer kernel available" : 
valider avec la touche ENTRÉE

# - "Which services should be restarted?" : 
valider avec la touche ENTRÉE

sudo reboot # patienter 1 minute
ssh student@<username>-server.eddi.cloud # pour se reconnecter
uname -r # confirmation : version 6
```

Si on ne vous demande pas l'update de kernel automatiquement, on peut le forcer : 
- `sudo apt upgrade -y`
- accepter avec ENTREE ce qu'il faut, et **reboot**.
- se reconnecter à notre VPS AWS après 1 minute de reboot

## Gestion des bases de données dans Postgres

```bash
# Se connecter au serveur Postgres en tant qu'utilisateur 'postgres'
sudo -i -u postgres psql

# Information serveur
\l    # lister les base de données existantes
\du   # lister les utilisateurs existants
\c    # vérifier la connexion courante

# Créer un utilisateur (ex: okanban)
CREATE ROLE okanban WITH LOGIN PASSWORD 'okanban'; # ici, en production, un bon mot de passe serait de bon ton, mais dans le cadre du cours, c'est OK !

# Créer une base de données (ex: okanban)
CREATE DATABASE okanban WITH OWNER okanban;

# Quitter psql
exit
```

## Installer `Node` (via `NVM`)

```bash
# Vérifier si Node n'est pas déjà installé
node -v  # Command 'node' not found
npm -v  # Command 'npm' not found
nvm -v   # Command 'nvm' not found

# Installer NVM (via la doc )
wget -qO- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash

# Exécuter les 3 commandes proposées 
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"

# Vérifier que NVM est bien installé
nvm -v
```

`NVM` = `Node Version Manager` = gestionnaire de version de Node.
- permet notamment de changer facilement de version de Node 18 -> 20 -> 18...
- [documentation](https://github.com/nvm-sh/nvm)

```bash
# Installer Node 20 et la configurer comme version par défaut
nvm install 20
nvm use 20
nvm alias default 20

# Valider
node -v # la version 20 !
```

### Comment choisir sa version de Node ?

- https://github.com/nodejs/Release
- https://github.com/nodejs/node

- `LTS` = `Long Term Support` à utiliser en production (`ACTIVE`)
- `Current` = version en cours de developpement

- Seule les versions **paires** de Node deviennent LTS.


## Déployer l'application

Pré-requis : 
- `Node.js` installé
- `Postgres` installé avec une base existante

```bash
# Lister les dossiers présents
ls

# Se déplacer dans le dépôt
cd S08-okanban-monorepo-RED-enzoclock

# Installer les dépendances du projet
npm install

# Copier le .env.example dans le fichier .env
cp .env.example .env

# Lire le contenu d'un fichier
cat .env

# Modifier le .env (VScode pas dispo car on est en SSH dans un terminal !) => nano
nano .env

# Modifier les valeurs, sauvegarder et quitter puis vérifier à nouveau
cat .env
```

Récupérer l'URL HTTP de notre serveur via [Kourou](https://kourou.oclock.io/ressources/vm-cloud/)

```bash
# .env

PG_URL=postgres://okanban:okanban@localhost:5432/okanban

PORT=3000

CORS_ORIGIN=*

VITE_API_BASE_URL=http://PSEUDO-server.eddi.cloud:3000/api

# Attention, ne pas rajouter de / final

# Pas d'espace autour des =
```

Enregistrer puis quitter nano : 
- Write Out : `CTRL + O` puis `ENTER`
- Exit : `CTRL + X`

(apparemment, `CTRL + S` marche aussi bien vu Jérémie !)

```bash
# Build le front
npm run build

# Vérifier que le build est créé
ls client

# Créer les tables (sans ajouter l'echantillonnage)
npm run db:create

# Démarrer le serveur en mode production
npm run start
```

Pour tester, retourner sur votre VM Téléporteur (à défaut, la machine sur laquelle vous avez la page de gestion des machine Cloud ouverte) et entrer l'URL de son serveur : 
- http://pseudo-server.eddi.cloud:3000


## BONUS 1 : Faire tourner Okanban en tâche de fond

Avec **PM2** = **Process Manager 2** (pour Node.js) permet de lancer des processus Node en tâche de fond (`daemon`).

```bash
# Retour dans le dépôt S08-.....
cd S08-...

# Installer pm2
npm install -g pm2

# Vérifier l'installation
pm2 -v

# Lancer okanban avec pm2
pm2 start server.js --name okanban

# Vérifier les services lancés avec PM2
pm2 list

# Regarder les logs du processus
pm2 log
```

## BONUS 2 : Lancer pm2 automatiquement au démarrage du serveur AWS

```bash
# Récupérer la commande pour démarrer pm2 automatiquement au démarrage
pm2 startup

# ===> puis copier coller la commande proposée
...

# Redemarrer et attendre 1 minute pour tester
sudo reboot
```

## BONUS 3 : Reverse Proxy NGINX

Actuellement, j'accède à cette URL pour visiter Okanban : 
- `http://enzoclock-server.eddi.cloud:3000`

J'aimerais plutôt visiter : 
- `http://okanban.enzoclock-server.eddi.cloud`

Note : 
- si on veut changer la partie `enzoclock-server.eddi.cloud`, on doit acheter un nom de domaine ($)

Globalement, ce qu'on veut : 
- ajouter un sous domaine
- retirer le port 3000 de l'URL

Ports par défaut : 
- HTTP ==> port 80
- HTTPS ==> port 443

On installe un `reverse proxy` : 
- rediriger les requêtes du port 80 du sous domaine okanban vers notre app okanban
- pour cela on va installer et configurer un serveur `NGINX`

```bash
# Placer vous dans votre VM AWS !!!
uname -a # ==> pseudo-server.cloud.eddi.xyz
ssh ..... # Sinon, on se reconnecte en SSH !

# Installer nginx
sudo apt install -y nginx

# Vérifier l'installation
sudo systemctl status nginx  # active (running)
```

Tester son serveur nginx : 
- `http://enzoclock-server.eddi.cloud/` (sans le port 3000, donc par défaut le port 80)
- vous devriez avoir un `Welcome to nginx!`

Rendre le port 80 publique via : https://kourou.oclock.io/ressources/vm-cloud/
- **RENDRE VM publique**

### Modification de la configuration du server NGINX pour en faire un reverse proxy

```bash
# Se déplacer dans le dossier de configuration de nginx
cd /etc/nginx

# Créer un fichier de configuration pour notre sous domaine Okanban
sudo nano /etc/nginx/sites-available/okanban.conf

# Créer un lien symbolique pour activer cette configuration
sudo ln -s /etc/nginx/sites-available/okanban.conf /etc/nginx/sites-enabled/okanban.conf

# Valider la syntaxe de la configuration
sudo nginx -t

# Relancer nginx
sudo systemctl reload nginx # (pas de nouvelle bonne nouvelle)
```



```bash
# ATTENTION MODIFIER BIEN VOTRE USERNAME

server {
  listen 80;
  server_name okanban.enzoclock-server.eddi.cloud;
  location / {
    proxy_pass      http://localhost:3000;
  }
}

## Enregistrer et quitter Nano comme d'habitude
CTRL + S    ou CTRL + O (ENTER)   puis CTRL + X
```


### Problème 

Notre front appelle l'URL suivant :
`VITE_API_BASE_URL=http://enzoclock-server.eddi.cloud:3000`

Mais le port 3000 n'est pas accessible au reste du monde !

On va aller remodifier le `.env` puis `rebuild` 

```bash
# Retour au dossier utilisateur
cd ~

# Retour au dossier du proket
cd S08-...

# Modifier le .env
nano .env

# Modifier le VITE_API_BASE_URL (sans le /)
VITE_API_BASE_URL=http://okanban.enzoclock-server.eddi.cloud/api` 

# Recréer le build
npm run build
```

