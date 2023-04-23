import { Chat_type } from "../models/chatModel";
import { Game } from "../models/gameModel";
import { Player } from "../models/playerModel";
import { Clairvoyant, Contamination, Insomnia, Spiritism } from "../models/powersModel";
import { Human, Werewolf } from "../models/villagerModel";
import { Vote, Vote_type } from "../models/voteModel";

function randint(a: number, b: number): number {
    return Math.floor(Math.random() * b) + a;
}
/** Create a new permutation of players
 * @param {Player[]} players players to shuffle
 */
function shuffle(players: Player[]): void {
    for (let i = 0; i < players.length; i++) {
        const playerTemp = players[i];
        //Bettween i and players.length
        const j = randint(i, players.length);
        players[i] = players[j];
        players[j] = playerTemp;
    }
}

/** Set all role in the game
 * @param {Game} game Game with all player added
 */
function setupGame(game: Game): void {
    const gameParam = game.getGameParam();
    const players = game.getAllPlayers();

    const powersWerewolf = [];
    const powersHuman = [];
    // On choisi si on utilise les pouvoirs
    if (randint(0, 1) <= gameParam.probaContamination) powersWerewolf.push(new Contamination());
    if (randint(0, 1) <= gameParam.probaInsomnie) powersHuman.push(new Insomnia());
    if (randint(0, 1) <= gameParam.probaSpiritisme) {
        if (randint(0, 1) <= gameParam.percentageWerewolf) powersWerewolf.push(new Spiritism());
        else powersHuman.push(new Spiritism());
    }
    if (randint(0, 1) <= gameParam.probaVoyance) {
        if (randint(0, 1) <= gameParam.percentageWerewolf) powersWerewolf.push(new Clairvoyant());
        else powersHuman.push(new Clairvoyant());
    }
    shuffle(players);
    let i;
    // attribution des roles loups garous et des pouvoirs loups garous
    for (i = 0; i < Math.floor(gameParam.percentageWerewolf * game.getAllPlayers().length); i++) {
        players[i].setRole(new Werewolf());
        if (i < powersWerewolf.length) players[i].getRole().setPower(powersWerewolf[i]);
    }
    const startIndex = i;

    // attribution des roles humains et des pouvoir humains
    for (i = startIndex; i < game.getAllPlayers().length; i++) {
        players[i].setRole(new Human());
        if (i - startIndex < powersHuman.length) players[i].getRole().setPower(powersHuman[i]);
    }
    console.log("affectation Complete");
}

/** Apply all action happend during the night and lunch a day
 * @param {Game} game Game to apply change
 */
function startDay(game: Game): void {
    console.log(`The sun is rising, status : ${game.getStatus().status} for game :${game.getGameId()}`);
    // Réinitialisation du chat
    game.getChat(Chat_type.CHAT_VILLAGE).resetMessages();
    game.getChat(Chat_type.CHAT_SPIRITISM).resetChatMembers([]);

    // Initialisation du vote
    game.setVote(new Vote(Vote_type.VOTE_VILLAGE, game.getAllPlayers()));

    //Envoie a chaque joueur un nouveau game recap
    for (const player of game.getAllPlayers()) player.sendNewGameRecap();

    // TODO: Update table player

    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    setTimeout(() => startNight(game), game.getGameParam().dayLength);
}

/** lunch a night
 * @param {Game} game Game to apply change
 */
function startNight(game: Game): void {
    console.log(`The night falling, status : ${game.getStatus().status} for game :${game.getGameId()}`);
    // Réinitialisation des chats
    game.getChat(Chat_type.CHAT_WEREWOLF).resetMessages();
    game.getChat(Chat_type.CHAT_SPIRITISM).resetMessages();

    // Initialisation du vote
    game.setVote(
        new Vote(
            Vote_type.VOTE_WEREWOLF,
            game.getAllPlayers().filter((player) => player.getRole() instanceof Werewolf)
        )
    );

    //Envoie a chaque joueur un nouveau game recap
    for (const player of game.getAllPlayers()) player.sendNewGameRecap();

    // TODO: Update table player

    // call startDay at the end of the day
    setTimeout(() => startDay(game), game.getGameParam().nightLength);
}

/** Function to add when a game is restored or start
 * Setup the game (probability, role, ...)
 * Add event call at each end of days (use interval or timeout), ...
 * @param {number} gameId id of the starting game
 * */
export async function initGame(gameId: number): Promise<void> {
    const game: Game = Game.getGame(gameId);
    // if (game.getGameParam().nbPlayerMin > game.getNbOfPlayers()) {
    //     Game.removeGame(game.getGameId());
    //     await database.deleteFrom("games").where("games.id", "=", game.getGameId()).executeTakeFirst();
    //     return;
    // }

    // Initialisation des chats
    game.initChats();
    const gameStatus = game.getStatus();
    if (gameStatus.status == 0) setupGame(game);

    // Initialisation des rôles
    game.initRole();

    // Lancement du jours ou de la nuit selon la date actuel
    console.log(`game ${gameId} successfuly initialized`);
    if (gameStatus.status % 2 == 0) startDay(game);
    else startNight(game);
}
