export type RequestError = {
    message: string;
    status: number;
    response?: Response;
    error?: any;
};

export default function request(input: RequestInfo | URL, init?: RequestInit | undefined): Promise<Response> {
    return new Promise((resolve, reject) => {
        fetch(input, init)
            .then((res) => {
                if (res.ok) {
                    resolve(res);
                } else {
                    reject({
                        message: res.text(),
                        status: res.status,
                        response: res
                    });
                }
            })
            .catch((e) => {
                reject({
                    message: e.message,
                    status: -1,
                    error: e
                });
            });
    });
}
