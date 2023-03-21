class User {

    private userName: string;
    private isConnected = false;

    constructor(userName: string) {
        this.userName = userName;
    }

    public getStatus(): boolean {
        return this.isConnected;
    }

}
