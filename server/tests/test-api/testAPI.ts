import colors from "colors";

export let nbTests = 0;
export let nbSuccess = 0;

export class Assert {

    private nbErrors: number;

    constructor() {
        this.nbErrors = 0;
    }

    public getNbErrors(): number {
        return this.nbErrors;
    }

    public equal(object1: any, object2: any): void {
        if (object1 === object2) return;
        if (typeof object1 === "object" && typeof object2 === "object" && JSON.stringify(object1) === JSON.stringify(object2)) return;
        this.nbErrors += 1;
        console.log(colors.grey(`ERROR assertion: equal - ${object1} is different from ${object2}`));
        console.log(colors.grey(JSON.stringify(object1)));
        console.log(colors.grey(JSON.stringify(object2)));
    }

    public assert(object: any): void {
        if (object) return;
        this.nbErrors += 1;
        console.log(colors.grey(`ERROR assertion: assert - ${object} is not true`));
    }

    // public async testOrTimeout(func: Promise<boolean>, timeout = 5000): Promise<void> {
    //     try {
    //         await new Promise<boolean>(async (resolve, reject) => {
    //             const id: NodeJS.Timeout = setTimeout(() => {
    //                 reject(false);
    //             }, timeout);
    //             // Test
    //             func.then((retval) => {
    //                 resolve(retval);
    //                 if (!retval) {
    //                     this.nbErrors += 1;
    //                     console.log(colors.grey(`ERROR assertion: assert - return value is false`));
    //                 }
    //                 clearTimeout(id);
    //             }).catch(reject);
    //         });
    //     } catch (e) {
    //         this.nbErrors += 1;
    //         console.log(colors.grey(`ERROR timeout - ${timeout} ms`));
    //     }
    // }

    public async testOrTimeout(func: Promise<boolean>, timeout = 5000): Promise<void> {
        try {
            const result = await Promise.race([new Promise((resolve, reject) => setTimeout(reject, timeout)), func]);
            if (!result) {
                this.nbErrors += 1;
                console.log(colors.grey(`ERROR assertion: assert - return value is false`));
            }
        } catch (e) {
            this.nbErrors += 1;
            console.log(colors.grey(`ERROR timeout - ${timeout} ms`));
        }
    }

}

export const test = async (message: string, func: (assert: Assert) => Promise<void>): Promise<void> => {
    nbTests += 1;
    console.log();
    console.log(colors.yellow(`#### ${message} ####`));

    const assert: Assert = new Assert();
    await func(assert);
    if (assert.getNbErrors() > 0) {
        console.log(colors.red("Failed"));
    } else {
        console.log(colors.green("Succeed"));
        nbSuccess += 1;
    }
};
