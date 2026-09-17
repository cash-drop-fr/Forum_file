# FileForum

Mini-forum/chat public sans compte, version locale/PWA.

## Utilisation
Ouvre `index.html` dans un navigateur ou héberge le dossier sur GitHub Pages/Netlify/etc.

Cette version stocke les messages et fichiers dans `localStorage` du navigateur. Elle ne synchronise donc pas les appareils.

## Pour une vraie version publique
Il faudra remplacer le stockage local par un backend ou un service de stockage accessible publiquement. Le frontend est déjà structuré pour cela.

Limite locale actuelle : 15 Mo par fichier, avec une limite globale dépendant du navigateur.
