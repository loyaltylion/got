import { expectType } from "tsd-check";
import got, { Got, GotFunction } from ".";
import { createServer } from "./test/helpers/server";

createServer().then(server => {
	server.on("/", (_request, response) => {
		response.end();
	});

	server.on("/", (_request, response) => {
		response.end();
	});

	server.on("/timeout", (_request, response) => {
		setTimeout(() => response.end(), 11000);
	});

	const serverUrl: string = (server as any).url;

	got(serverUrl, {
		hooks: {
			beforeRequest: [
				options => {
					expectType<Object>(options);
				}
			]
		}
	});

	expectType<Promise<Got.Response>>(got(serverUrl));
});

// Test Got

const requestMethods = ["get", "post", "put", "patch", "head", "delete"];

// Test Got HTTP methods
requestMethods.map(async key => {
	expectType<Got.Response>(await got[key]());
});

expectType<GotFunction>(got.extend({}));
expectType<Got.HTTPError>(new Got.HTTPError());
expectType<Got.TimeoutError>(new Got.TimeoutError());
