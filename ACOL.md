# Rendu pour la partie ACOL

## (a) Analyse

### Description des acteurs

Dans le de notre projet, nous avons défini plusieurs acteurs grâce à la documentation que nous a été fourni.

<p align="center">
    <img src="documentation/global/out/acteurs.pn   g">
</p>

<br>

- User est l'acteur principal de notre application, c'est lui qui fait les actions du jeu.
- Player représente les personnes physiques qui joue au jeu.
- Server quant à lui un acteur secondaire, il représente notre serveur et les actions qu'il effectue.




### Diagramme de cas d’utilisations

Chaque acteur peut faire différentes actions comme vous pouvez le voir ci-dessous.

<p align="center">
    <img src="documentation/global/client/../../client/out/use_case.png">
</p>


<br>

#### Diagrammes de séquences système

Le diagramme Use case étant parfois, pas assez claire, nous avons choisi de faire des diagrammes de séquences systèmes pour certaines parties de notre application.

- Chat

Pré-conditions:
- Le serveur doit etre lancé.
- Les joueurs doivent etre connectés

Post-conditions:
- Les messages sont recus par tout les players


<p align="center">
    <img src="documentation/global/client/../../global/out/sequence_analyse_message_chat.png">
</p>
