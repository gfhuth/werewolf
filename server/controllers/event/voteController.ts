import { Game } from "../../models/gameModel";
import { Player } from "../../models/playerModel";
import { VoteType } from "../../models/voteModel";
import { Event } from "../eventController";

const voteVerification = (game: Game, player: Player, data: { vote_type: VoteType; playerVoted: string; ratification?: boolean }): boolean => {
    if (!game.getVote()) {
        player.sendError("VOTE_ERROR", 403, "Game hasn't started");
        return false;
    }
    if (game.getVote().getType() !== data.vote_type) {
        player.sendError("VOTE_ERROR", 403, `Vote type is ${game.getVote().getType()} but vote type ${data.vote_type}is expected`);
        return false;
    }
    if (!game.getPlayer(data.playerVoted)) {
        player.sendError("VOTE_ERROR", 403, "Player voted is not in the game");
        return false;
    }
    if (game.getVote().isClosed()) {
        player.sendError("VOTE_ERROR", 403, "Vote is closed");
        return false;
    }
    if (!game.getVote().getParticipants().includes(game.getPlayer(data.playerVoted))) {
        player.sendError("VOTE_ERROR", 403, "Player voted doesn't participate to this vote");
        return false;
    }
    if (Player.alivePlayers(game.getVote().getParticipants()).length === 0) {
        player.sendError("VOTE_ERROR", 403, "There is no alive player in this game");
        return false;
    }
    if (player.isDead()) {
        player.sendError("VOTE_ERROR", 403, "Dead player cannot participate to the vote");
        return false;
    }
    return true;
};

const voteProposition = (game: Game, player: Player, data: { vote_type: VoteType; playerVoted: string }): void => {
    if (!voteVerification(game, player, data)) return;
    game.getVote().addProposition(player, game.getPlayer(data.playerVoted));
};

const voteRatification = (game: Game, player: Player, data: { vote_type: VoteType; playerVoted: string; ratification: boolean }): void => {
    if (!voteVerification(game, player, data)) return;
    game.getVote().ratifyProposition(player, game.getPlayer(data.playerVoted), data.ratification);
};

// Liste des événements relatifs aux votes
Event.registerHandlers("VOTE_SENT", voteProposition);
Event.registerHandlers("RESPONSE_RATIFICATION", voteRatification);
