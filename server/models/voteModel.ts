import { Player } from "./playerModel";
import { User } from "./userModel";

export enum Vote_type {
    VOTE_VILLAGE,
    VOTE_WEREWOLF,
}

export type jsonVote = { vote_type: Vote_type; vote: string };

export class Vote {

    private type: Vote_type;
    private votes: { [key: string]: Player };
    private participants: Array<Player>;
    private result: Player;

    constructor(type: Vote_type, players: Array<Player>) {
        this.type = type;
        this.participants = players;
        players.forEach((player) => (this.votes[player.getUser().getUsername()] = null));
        this.result = null;
    }

    public getType(): Vote_type {
        return this.type;
    }

    public isClosed(): boolean {
        return this.result !== null;
    }

    public addVote(playerWhoVote: Player, vote: Player): void {
        this.votes[playerWhoVote.getUser().getUsername()] = vote;

        // On vérifie si on peut valider le vote
        for (const player in this.votes) if (this.votes[player] !== vote) return;
        this.result = vote;

        // On annonce à tous les joueurs que le vote est validé
        for (const player of this.participants) player.sendMessage("VOTE_VALID", { result: this.result.getUser().getUsername() });
    }

}
