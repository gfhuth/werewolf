export type RequestError = {
    message: string;
    status: number;
    response?: Response;
    error?: any;
};

export default function request(input: RequestInfo | URL, init?: RequestInit | undefined): Promise<Response> {
    return new Promise((resolve, reject) => {
        console.log(init?.body);
        fetch(input, init)
            .then(async (res) => {
                if (res.ok) {
                    resolve(res);
                } else {
                    reject({
                        message: await res.text(),
                        status: res.status,
                        response: res
                    });
                }
            })
            .catch((e) => {
                console.log("Request error:", e);
                reject({
                    message: e.message,
                    status: -1,
                    error: e
                });
            });
    });
}
