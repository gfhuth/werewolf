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

    public getVotes(): { [key: string]: { [key: string]: boolean | undefined } } {
        return this.votes;
    }

    public isClosed(): boolean {
        return this.result !== null;
    }

    public countRatification(): { [key: string]: { nbValidation: number; nbInvalidation: number } } {
        const res: { [key: string]: { nbValidation: number; nbInvalidation: number } } = {};

        for (const target of Object.keys(this.votes)) {
            const targetCounts = Object.values(this.votes[target])
                .map((v) => ({ nbValidation: v ? 1 : 0, nbInvalidation: v ? 0 : 1 }))
                .reduce(
                    (a, b) => ({
                        nbValidation: a.nbValidation + b.nbValidation,
                        nbInvalidation: a.nbInvalidation + b.nbInvalidation
                    }),
                    { nbValidation: 0, nbInvalidation: 0 }
                );
            if (targetCounts.nbValidation > 0 || targetCounts.nbInvalidation > 0) res[target] = targetCounts;
        }

        return res;

        // let nbValidation, nbInvalidation: number;
        // for (const nameVoted of this.participants.map<string>((player) => player.getUser().getUsername())) {
        //     nbValidation = 0;
        //     nbInvalidation = 0;
        //     for (const playerName in this.votes[nameVoted]) {
        //         if (this.votes[nameVoted][playerName] === true) nbValidation += 1;
        //         else if (this.votes[nameVoted][playerName] === false) nbInvalidation += 1;
        //     }
        //     res[nameVoted] = { nbValidation: nbValidation, nbInvalidation: nbInvalidation };
        // }
        // return res;
    }

    private voteValidation(playerVoted: Player): void {
        let nbVote = 0;
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
        this.votes[playerVoted.getUser().getUsername()] = {
            [playerWhoVote.getUser().getUsername()]: true
        };

        this.participants
            .filter((player) => player !== playerWhoVote)
            .forEach((player) => player.sendMessage("ASK_RATIFICATION", { vote_type: this.type, playerVoted: playerVoted.getUser().getUsername() }));

        // On regarde si le vote est terminée et/ou valide
        this.voteValidation(playerVoted);
    }

    public ratifyProposition(playerWhoRatify: Player, playerVoted: Player, ratification: boolean): void {
        this.votes[playerVoted.getUser().getUsername()][playerWhoRatify.getUser().getUsername()] = ratification;

        // On envoie une mise à jour du vote à tous les participants
        const cpt: { nbValidation: number; nbInvalidation: number } = this.countRatification()[playerVoted.getUser().getUsername()];
        this.participants.forEach((player) =>
            player.sendMessage("UPDATE_PROPOSITION", { vote_type: this.type, playerVoted: playerVoted.getUser().getUsername(), nbValidation: cpt.nbValidation, nbInvalidation: cpt.nbInvalidation })
        );

        // On regarde si le vote est terminée et/ou valide
        this.voteValidation(playerVoted);
    }

}
