import { Game } from "../../models/gameModel";
import { Player } from "../../models/playerModel";
import { User } from "../../models/userModel";
import { jsonVote } from "../../models/voteModel";
import { Event } from "../eventController";

const newVote = async (game: Game, user: User, data: jsonVote): Promise<void> => {
    // On récupère le joueur qui a envoyé le message
    const player: Player = game.getPlayer(user.getUsername());

    if (!game.getVote()) {
        player.sendError("VOTE_ERROR", 403, "Game hasn't started");
        return;
    }
    if (game.getVote().getType() !== data.vote_type) {
        player.sendError("VOTE_ERROR", 403, `Vote type is ${game.getVote().getType()} but vote type ${data.vote_type}is expected`);
        return;
    }
    if (!game.getPlayer(data.vote)) {
        player.sendError("VOTE_ERROR", 403, "Player is not valid");
        return;
    }
    if (game.getVote().isClosed()) {
        player.sendError("VOTE_ERROR", 403, "Vote is closed");
        return;
    }
    if (!game.getVote().getParticipants().includes(game.getPlayer(data.vote))) {
        player.sendError("VOTE_ERROR", 403, "Player doesn't participate to this vote");
        return;
    }

    game.getVote().addVote(player, game.getPlayer(data.vote));
};

// Liste des événements relatifs aux votes
Event.registerHandlers("VOTE_SENT", newVote);
