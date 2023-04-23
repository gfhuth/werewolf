import { Game } from "../../models/gameModel";
import { User } from "../../models/userModel";
import { jsonVote } from "../../models/voteModel";
import { Event } from "../eventController";

const newVote = async (game: Game, user: User, data: jsonVote): Promise<void> => {
    if (game.getVote().getType() !== data.vote_type) {
        user.sendMessage({ event: "VOTE_SENT", status: 403, message: "Wrong vote type" });
        return;
    }
    if (!game.getPlayer(data.vote)) {
        user.sendMessage({ event: "VOTE_SENT", status: 403, message: "Player is not valid" });
        return;
    }
    if (game.getVote().isClosed()) {
        user.sendMessage({ event: "VOTE_SENT", status: 403, message: "Vote is closed" });
        return;
    }

    game.getVote().addVote(game.getPlayer(user.getUsername()), game.getPlayer(data.vote));
};

// Liste des événements relatifs aux votes
Event.registerHandlers("VOTE_SENT", newVote);
