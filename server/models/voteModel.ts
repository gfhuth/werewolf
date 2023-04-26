import { Player } from "./playerModel";

export enum VoteType {
    VOTE_VILLAGE,
    VOTE_WEREWOLF,
}

export class Vote {

    private type: VoteType;
    private votes: { [key: string]: Player } = {};
    private participants: Array<Player>;
    private result: Player;

    constructor(type: VoteType, players: Array<Player>) {
        this.type = type;
        this.participants = players;
        players.forEach((player) => (this.votes[player.getUser().getUsername()] = null));
        this.result = null;
    }

    public getType(): VoteType {
        return this.type;
    }

    public getParticipants(): Array<Player> {
        return this.participants;
    }

    public getResult(): Player {
        return this.result;
    }

    public isClosed(): boolean {
        return this.result !== null;
    }

    public addVote(playerWhoVote: Player, vote: Player): void {
        this.votes[playerWhoVote.getUser().getUsername()] = vote;

        playerWhoVote.sendMessage("VOTE_RECEIVED", { vote_type: this.type });

        // On vérifie si on peut valider le vote
        for (const player in this.votes) if (this.votes[player] !== vote) return;

        this.result = vote;

        // On annonce à tous les joueurs que le vote est validé
        for (const player of this.participants) player.sendMessage("VOTE_VALID", { vote_type: this.type, result: this.result.getUser().getUsername() });
    }

}
