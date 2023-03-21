export type GameParam = {
    id: number;
    nbPlayer: number;
    dayLenght: number;
    nightLenght: number;
    startDate: number;
    percentWereWolf: number;
    proba: { contamination: number; insomnie: number; voyance: number; spiritisme: number };
};

export class Game {

    private gameParam: GameParam;
    constructor(gameParam: GameParam) {
        this.gameParam = gameParam;
    }

    public getGameParam(): GameParam {
        return this.gameParam;
    }

}
