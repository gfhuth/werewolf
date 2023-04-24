import { Game } from "../../models/gameModel";
import { Player } from "../../models/playerModel";
import { User } from "../../models/userModel";
import { jsonVote } from "../../models/voteModel";
import { Event } from "../eventController";

const newVote = async (game: Game, user: User, data: jsonVote): Promise<void> => {
    // On récupère le joueur qui a envoyé le message
    const player: Player = game.getPlayer(user.getUsername());

    if (game.getVote().getType() !== data.vote_type) {
        player.sendError("VOTE_SENT", 403, "Wrong vote type");
        return;
    }
    if (!game.getPlayer(data.vote)) {
        player.sendError("VOTE_SENT", 403, "Player is not valid");
        return;
    }
    if (game.getVote().isClosed()) {
        player.sendError("VOTE_SENT", 403, "Vote is closed");
        return;
    }

    game.getVote().addVote(player, game.getPlayer(data.vote));
};

// Liste des événements relatifs aux votes
Event.registerHandlers("VOTE_SENT", newVote);
