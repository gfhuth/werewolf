import axios, { AxiosRequestConfig } from "axios";

export type RequestError = {
    message: string;
    status: number;
    response?: Response;
    error?: any;
};

export default function request(input: string, init?: RequestInit | undefined): Promise<Response> {
    return new Promise((resolve, reject) => {
        console.log(init?.body);
        axios({
            url: input.toString(),
            headers: init?.headers,
            method: init?.method,
            data: init?.body
        } as AxiosRequestConfig)
            .then((res) => {
                if (Math.floor(res.status / 100) === 2) {
                    resolve(res.data);
                } else {
                    reject({
                        message: res.statusText,
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

        // fetch(input, init)
        //     .then(async (res) => {
        //         if (res.ok) {
        //             resolve(res);
        //         } else {
        //             reject({
        //                 message: await res.text(),
        //                 status: res.status,
        //                 response: res
        //             });
        //         }
        //     })
        //     .catch((e) => {
        //         console.log("Request error:", e);
        //         reject({
        //             message: e.message,
        //             status: -1,
        //             error: e
        //         });
        //     });
    });
}
