import { Chat, Chat_type } from "../models/chatModel";
import { Game } from "../models/gameModel";
import { Player } from "../models/playerModel";
import { Clairvoyant, Contamination, Spiritism } from "../models/powersModel";
import { Human, Werewolf } from "../models/villagerModel";
import { getGame } from "./gameSetupController";

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
    if (randint(0, 1) <= gameParam.probaInsomnie) powersHuman.push(new Contamination());
    if (randint(0, 1) <= gameParam.probaSpiritisme) {
        if (randint(0, 1) <= gameParam.percentageWerewolf) 
            powersWerewolf.push(new Spiritism());
        else 
            powersHuman.push(new Spiritism());
    }
    if (randint(0, 1) <= gameParam.probaVoyance) {
        if (randint(0, 1) <= gameParam.percentageWerewolf) 
            powersWerewolf.push(new Clairvoyant());
        else 
            powersHuman.push(new Clairvoyant());
    }
    shuffle(players);
    let i;
    // attribution des roles loups garous et des pouvoirs loups garous
    for (i = 0; i < Math.floor(gameParam.percentageWerewolf * game.getNbOfPlayers()); i++) {
        players[i].setRole(new Werewolf(null, null, null));
        if (i < powersWerewolf.length) 
            players[i].getRole().setPower(powersWerewolf[i]);
    }
    const startIndex = i;

    // attribution des roles humains et des pouvoir humains
    for (i = startIndex; i < game.getNbOfPlayers(); i++) {
        players[i].setRole(new Human(null, null));
        if (i - startIndex < powersHuman.length) 
            players[i].getRole().setPower(powersHuman[i]);
    }
}

/** Apply all action happend during the night and lunch a day
 * @param {Game} game Game to apply change
 */
function startDay(game: Game): void {
    console.log(`The sun is rising, status : ${game.getStatus().status} for game :${game.getGameId()}`);
    // Initialisation du chat
    game.addChat(new Chat(Chat_type.CHAT_GLOBAL, game.getAllPlayers()));
    // update death player

    // TODO: Update table player

    // TODO : Send a message at every connected client
    for (let i = 0; i < game.getAllPlayers().length; i++) game.getAllPlayers()[i].sendNewGameStatus(true);

    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    setTimeout(() => startNight(game), game.getGameParam().dayLength * 1000);
}

/** Apply all action happend during the day and lunch a night
 * @param {Game} game Game to apply change
 */
function startNight(game: Game): void {
    console.log(`The night falling, status : ${game.getStatus().status} for game :${game.getGameId()}`);
    // Initialisation des chats
    // TODO: remplacer la valeur 0 par la valeur qui indique que le joueur est un loup garou
    game.addChat(
        new Chat(
            Chat_type.CHAT_LOUP,
            game.getAllPlayers().filter((player) => player.getRole().getRoleValue() === 0)
        )
    );
    // TODO: mettre dans ce chat le chaman et le mort avec lequel il parle
    game.addChat(new Chat(Chat_type.CHAT_CHAMAN, game.getAllPlayers()));

    // TODO: Update table player

    // TODO : Send a message at every client
    for (let i = 0; i < game.getAllPlayers().length; i++) game.getAllPlayers()[i].sendNewGameStatus(false);

    // call startDay at the end of the day
    setTimeout(() => startDay(game), game.getGameParam().nightLength * 1000);
}

/** Function to add when a game is restored or start
 * Setup the game (probability, role, ...)
 * Add event call at each end of days (use interval or timeout), ...
 * @param {number} gameId id of the starting game
 * */
export async function initGame(gameId: number): Promise<void> {
    const game: Game = getGame(gameId);
    const gameStatus = game.getStatus();
    if (gameStatus.status == 0) setupGame(game);

    console.log(`game ${gameId} successfuly started`);
    if (gameStatus.status % 2 == 0) startDay(game);
    else startNight(game);
}
