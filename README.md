# Installation pour développement
# Présentation du projet


<center>
    <img src="asset/imageReadme.png">
</center>

<br><br>
Le projet consiste a créer le jeux Loup-Garou sur mobile et web. Pour ce faire nous avons crée toute une application avec l'architecture MVC que vous pouvez voir ci-desous.


<center>
    <img src="documentation/global/out/mvc.png">
</center>


Pour ce projet nous avons utilisé plusieurs technologies:

* React Native
* Yarn
* Expo

* Plusieurs librairies (voir le fichier package.json)

# Documentation pour l’installation et les tests


## Installation pour développement

## Dépendances: 

- Installer en global `npm i -g yarn ts-node expo`
- Installer sur vscode [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint), [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode), [Prettier ESLint](https://marketplace.visualstudio.com/items?itemName=rvest.vs-code-prettier-eslint), [TODO Tree](https://marketplace.visualstudio.com/items?itemName=Gruntfuggly.todo-tree)


## (a) Analyse:

### Description des acteurs:
    
<center>
    <img src="documentation/global/out/acteurs.png">
</center>

    - User: Ce sont les utilisateur qui veut créer un compte ou se authentifier dans une compte déjà crée.
    
    - Player: Ce sont les utilisateurs déjà authentifié qui interagissent avec le système et jouent au jeu. Il peuvent rejoindre une partie, effectuer des actions pendant la partie (comme voter ou effectuer des attaques...), créer de nouvelles parties, afficher des informations sur le jeu et quitter la partie.

    - Server: c'est une monolithe que a les attribution de gérer la logique du jeu et coordonne l'interaction entre les joueurs. Il reçoit et traite les actions du client, met à jour l'état du jeu et envoie des mises à jour d'état à tous les joueurs. Le serveur de jeu gère l'authentification et l'autorisation des joueurs. L’implémentation des protocole HTTP ou WebSocket permettre la communication avec le client. Aussi c'est une role du server implémenter la base de donné pour les donné pérenne stockant les données du jeu, telles que les informations des joueurs, l'état du jeu e messages.

### Diagramme de cas d’utilisations:

<center>
    <img src="documentation/client/out/use_case.png">
</center>

<center>
    <img src="documentation/server/out/use_case.png">
</center>

# Développement du backend

Il est possible d'étendre le jeu du loup-garou et de rajouter des pouvoirs. On peut imaginer des pouvoirs tel que le *\color{black}{Voleur}* qui échange son pouvoir avec quelqu'un d'autres, ou la mise en place de *\color{black}{Cupidon}* qui rend deux personnes amoureuses.  
  
Afin de faciliter le mise en place de ces extensions, le développement du jeu a fait en sorte qu'il suffit de rajouter un fichier dans le répertoire `models/powers/` qui implémente le pouvoir.  
  
Un pouvoir est représenté par une classe qui étends la classe `Power` en donnant les deux informations suivantes :

- le nom du pouvoir
- un booléen qui indique si le pouvoir s'applique immédiatement dans la nuit ou uniquement au début du jour

La classe du pouvoir implément uniquement deux méthodes :

- `applyPower`: permet d'appliquer le pouvoir
- `usePower`: effectuer des vérifications des conditions d'application du pouvoir et appelle `applyPower` uniquement si le pouvoir s'applique immédiatement la nuit.

Enfin, afin qu'un joueur puisse utiliser le pouvoir, il est nécessaire de créer un événement `USE_POWER_POWERNAME` associé à ce pouvoir dans la liste des événements et d'y associer la méthode usePower. Cette tâche se fait facilement avec la ligne de code suivante que l'on place à la fin du fichier, en dehors de la classe :

```ts
Event.registerHandlers("USE_POWER_POWERNAME", usePower);
```


### Description de ces cas d’utilisations au travers de diagrammes de séquences système pertinents:

#### Creation de la partie:

<center>
    <img src="documentation/global/out/sequence_analyse_creation_partie.png">
</center>

#### Deroulement de la partie:

<center>
    <img src="documentation/global/out/sequence_analyse_deroulement_partie.png">
</center>

#### Messages du chat:

<center>
    <img src="documentation/global/out/sequence_analyse_message_chat.png">
</center>

### Diagramme de classes d’analyse:

<center>
    <img src="documentation/server/out/diagramme_de_classes_analyse.png">
</center>

### Diagramme d’états/transitions si nécessaire:

## Document de conception:

### L’architecture:

<center>
    <img src="documentation/global/out/mvc.png">
</center>



### Conception détaillée:

- #### Diagramme de classes logicielles:

<center>
    <img src="documentation/server/out/classe_models.png">
</center>

- #### Diagrammes de séquence:

- #### Diagrammes d’états-transitions: