# Création d'un mono-dépôt

- On part du dossier backend que l'on duplique.
- Retirer `git` si besoin

- (bonus) Créer un dépôt `S08-okanban-monorepo`, soit depuis Github, soit via le CLI de Github (`gh`).
  - `gh repo create`

- Ajouter un script `npm run postinstall` pour automatiquement installer les dependances front lors du `npm install` du back.

- Ajouter un script `npm run build` dans le backend pour lancer le `npm run build` du client.

- Servir le "code front" sur la route `/` du backend !
  - on pourrait rajouter une route `/` qui renvoie `sendFile` les fichiers.
  - on va ajouter le middleware `express.static` pour servir le dossier `client/dist`
  - voir le `app.js`

- On rajoute une variable d'environnement `VITE_API_BASE_URL` dans le `.env`  afin que le client de Mme Michu qui consulte notre site puisse trouver l'adresse de l'API.

- Lorsqu'on génère le dossier `dist`, `Vite` ira chercher la variable pour la mettre dans le bundle à condition : 
  - d'utiliser `import.meta.env.VITE_API_BASE_URL`
  - d'ajouter un fichier de configuration `vite.config.js` pour préciser où se trouve les variables d'environnement
    - car elle n'est pas à la racine du dossier `client`, sinon on aurait pas eu besoin de le faire !

## Comment on lance le projet

- Installer les dépendances du backend
  - `npm install`

- Installer les dépendances du frontend
  - le `npm run postinstall` s'est lancé automatiquement à la fin du `npm install` précédent !

- Créer des variables d'environnement pour le backend
  - `cp .env.example .env` et modifier les valeurs

- Ajuster les variables d'environnement pour le frontend
  - `API_BASE_URL` dans le `.env`

- Créer les tables dans la BDD si elle existe
  - `npm run db:reset`

- Créer le dossier `client/dist`
  - `npm run build`

- Lancer les tests (pour le plaisir)
  - `npm run test`

- Lancer le backend (mode production)
  - `npm run start`
  - et le back sert statiquement le front sur la route `/` !

