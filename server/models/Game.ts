export type GameParam = {
    id: number;
    maxNbPlayer: number;
    dayLenght: number;
    nightLenght: number;
    startDate: Date;
    percentWereWolf: number;
    proba: { contamination: number; insomnie: number; voyance: number; spiritisme: number };
};

export class Game {

    private gameParam: GameParam;
    private hostName: string;
    private currentNumberOfPlayer = 1;

    constructor(gameParam: GameParam, hostName: string) {
        this.gameParam = gameParam;
        this.hostName = hostName;
    }

    public getGameParam(): GameParam {
        return this.gameParam;
    }
    //return json with : id, startDate, hostName, currentNumberOfPlayer, maxNbPlayer
    public toShortJson(): { [key: string]: string | number } {
        const id = this.gameParam.id;
        const startDate = this.gameParam.startDate;
        const hostName = this.hostName;
        const currentNumberOfPlayer = this.currentNumberOfPlayer;
        const maxNbPlayer = this.gameParam.maxNbPlayer;
        return {
            id: id,
            startDate: startDate.toLocaleString(),
            hostName: hostName,
            currentNumberOfPlayer: currentNumberOfPlayer,
            maxNbPlayer: maxNbPlayer
        };
    }

    //return json of this object
    public toLongJson(): { [key: string]: string | number } {
        const gameParam = this.gameParam;
        const hostName = this.hostName;
        const currentNumberOfPlayer = this.currentNumberOfPlayer;
        const wereWolfCount = Math.floor((gameParam.maxNbPlayer * gameParam.percentWereWolf) / 100);

        return {
            id: gameParam.id,
            maxNbPlayer: gameParam.maxNbPlayer,
            dayLenght: gameParam.dayLenght,
            nightLenght: gameParam.nightLenght,
            startDate: gameParam.startDate.toISOString(),
            percentWereWolf: gameParam.percentWereWolf,
            //proba: gameParam.proba,
            hostName: hostName,
            currentNumberOfPlayer: currentNumberOfPlayer,
            wereWolfCount: wereWolfCount
        };
    }

}
