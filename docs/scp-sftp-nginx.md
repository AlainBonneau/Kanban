# Déploiement de sites statiques 

Rappels : 
- `VM Kourou` = `VM Cloud` = `VM AWS` = [accès via Kourou](https://kourou.oclock.io/ressources/vm-cloud/)
- `Téléporteur` = `VM apprennant` = via **VMBox** (ou VM-cloud parfois) = utilisé depuis le début de la formation
- `Hôte` = Machine apprennant, là où est installé le téléporteur

## Via `SCP` (Secure Copy Protocol)

Depuis son Téléporteur, dans son dossier de travail habituel, cloner un site statique (HTML, CSS, JS) qu'il vous fera plaisir de déployer. Pour l'exemple, voilà `onews` :

Attention, choisir un **site statique sans base de données** !

```bash
# Créer un dossier onews
mkdir onews

# Créer quelques fichiers statiques
touch onews/index.html onews/style.css onews/script.js
```

```html
<!-- index.html -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>oNews</title>
  <link rel="stylesheet" href="./style.css">
</head>
<body>
  <h1>oNews</h1>
  <script src="./script.js"></script>
</body>
</html>
```

```js
// script.js
document.body.insertAdjacentHTML("beforeend", `
  <p>Date du jour : ${new Date().toLocaleDateString()}</p>
`);
```

```css
/* style.css */
body {
  background-color: #F0F;
}
```

Depuis un terminal du téléporter :

```bash
# Transférer onews sur le serveur de production via SCP
scp -r onews student@<username>-server.eddi.cloud:/home/student/
```

Depuis la VM Kourou :

```bash
# Créer un sous domaine pour notre application onews
sudo touch /etc/nginx/sites-available/onews.conf
sudo nano /etc/nginx/sites-available/onews.conf # ❗️ Ajouter la configuration fournie plus bas, sauvegarder et quitter
sudo nginx -t # pour vérifier la syntaxe

# Autoriser Nginx (appartement au groupe de permissions 'www-data') à lire les fichiers situés dans le repertoire onews
sudo chown :www-data /home/student/onews # changer le 'group ownership' du dossier
sudo find /home/student/onews -type d -exec chmod 755 {} \; # changer les droits du dossier et sous dossier
sudo find /home/student/onews -type f -exec chmod 644 {} \; # changer les droits des fichiers

sudo chmod o+X /home/student # (❗️ dépannage) donner des droits (eXecute-list) au groupe 'other' au dossier parent afin qu'il puisse accéder à /home/student/onews. Sans cette commande, Nginx ne trouvera pas le dossier /home/student/onews (même si on lui a donner les droits sur ces fichiers directement). En pratique pour une vraie prod, on irait plutôt mettre notre dossier onews dans /var.

# Activer la configuration
sudo ln -s /etc/nginx/sites-available/onews.conf /etc/nginx/sites-enabled/onews.conf

# Relancer 
sudo systemctl reload nginx

# Tester 
# http://onews.<username>-server.eddi.cloud

# Bonus : si vous souhaiter voir passer les logs server
sudo tail -f /var/log/nginx/error.log
```

```
# /etc/nginx/onews.conf

server {
  listen 80;
  server_name onews.<username>-server.eddi.cloud;

  root /home/student/onews;
  index index.html;

  location / {
      try_files $uri $uri/ =404;
  }
}
```

## Via `SFTP` (Secure File Transfer Protocol)

Contexte :
- `FTP` : File Transfer Protocol
  - non sécurisé
- `SFTP` : SSH File Transfer Protocol
  - FTP via SSH
  - généralement plus commun car OpenSSH est integré à la plupart des distributions Linux 
- `FTPS` : File Transfer Protocol Secure
  - FTP via SSL/TLS
  - généralement necessite plus de configuration

### Côté serveur (VM Kourou)

**Bonne nouvelle** : un serveur SSH est déjà installé sur nos VM Kourou. On va simplement modifier sa configuration.

Note : la bonne pratique serait d'avoir deux serveurs SSH dédiés, un pour SSH et l'autre pour SFTP, pour une meileure gestion des droits et utilisateur. 

```bash
# Installer/mettre à jour les packages SSH
sudo apt install ssh -y

# Editer la config SSH en authorisant la connexion via password
sudo sed -i 's/PasswordAuthentication no/PasswordAuthentication yes/' /etc/ssh/sshd_config

# Redémarrer le serveur ssh
sudo systemctl restart ssh

# Tester 
sftp student@localhost # mdp : par dessus les nuages
pwd
exit
```

### Côté client (VM Téléporter/hôte)

Installer le client FTP `Filezilla` et se connecter :
- Hôte : `sftp://<username>-server.eddi.cloud`
- Utilisateur : `student`
- Mot de passe : `par dessus les nuages`
- Port : laisser vide (22 par défaut)

Pour tester, déposer une favicon dans le projet `onews`  :
- Créer un fichier `favicon.svg` contenant le code suivant : 
  - `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100"><circle cx="50" cy="50" r="40" fill="#336699"></svg>`
- Modifier la balise `<head>` de l'`index.html` pour y ajouter le code suivant :
  - `<link rel="icon" href="favicon.svg">`
- Glisser déposer les deux fichiers ajoutés/modifiés dans le dossier `onews` du serveur Kourou via la connexion SFTP
- Force-refresh le rendu sur navigateur. La favicon est ajoutée !
```
