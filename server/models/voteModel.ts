import { Player } from "./playerModel";

export enum VoteType {
    VOTE_VILLAGE,
    VOTE_WEREWOLF,
}

export class Vote {

    private type: VoteType;
    private votes: { [key: string]: { [key: string]: boolean | undefined } } = {};
    private participants: Array<Player>;
    private result: Player;

    constructor(type: VoteType, players: Array<Player>) {
        this.type = type;
        this.participants = players;
        players.forEach((player) => (this.votes[player.getUser().getUsername()] = {}));
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

    private voteValidation(playerVoted: Player): void {
        let nbVote: number;
        for (const player of this.participants) {
            if (this.votes[playerVoted.getUser().getUsername()][player.getUser().getUsername()] === undefined) return;
            if (this.votes[playerVoted.getUser().getUsername()][player.getUser().getUsername()]) nbVote++;
        }
        if (nbVote <= (this.participants.length - 1) / 2) {
            this.participants.forEach((player) => player.sendMessage("VOTE_INVALID", { vote_type: this.type, playerVoted: playerVoted.getUser().getUsername() }));
            return;
        }

        this.result = playerVoted;
        // On annonce à tous les joueurs que le vote est validé
        this.participants.forEach((player) => player.sendMessage("VOTE_VALID", { vote_type: this.type, playerVoted: playerVoted.getUser().getUsername() }));
    }

    public addProposition(playerWhoVote: Player, playerVoted: Player): void {
        this.votes[playerVoted.getUser().getUsername()][playerWhoVote.getUser().getUsername()] = true;
        this.participants
            .filter((player) => player !== playerWhoVote)
            .forEach((player) => player.sendMessage("ASK_RATIFICATION", { vote_type: this.type, playerVoted: playerVoted.getUser().getUsername() }));

        // On regarde si le vote est terminée et/ou valide
        this.voteValidation(playerVoted);
    }

    public ratifyProposition(playerWhoRatify: Player, playerVoted: Player, ratification: boolean): void {
        this.votes[playerVoted.getUser().getUsername()][playerWhoRatify.getUser().getUsername()] = ratification;

        // On envoie une mise à jour du vote à tous les participants
        let nbValidation: number;
        let nbInvalidation: number;
        for (const playerName in this.votes[playerVoted.getUser().getUsername()]) {
            if (this.votes[playerVoted.getUser().getUsername()][playerName] === true) nbValidation += 1;
            else if (this.votes[playerVoted.getUser().getUsername()][playerName] === false) nbValidation += 1;
        }
        this.participants.forEach((player) =>
            player.sendMessage("UPDATE_PROPOSITION", { vote_type: this.type, playerVoted: playerVoted.getUser().getUsername(), nbValidation: nbValidation, nbInvalidation: nbInvalidation })
        );

        // On regarde si le vote est terminée et/ou valide
        this.voteValidation(playerVoted);
    }

}
