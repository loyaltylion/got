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

type RequestMethod = keyof Pick<
	GotFunction,
	"get" | "post" | "put" | "patch" | "head" | "delete"
>;

const requestMethods: ReadonlyArray<RequestMethod> = [
	"get",
	"post",
	"put",
	"patch",
	"head",
	"delete"
];

// Test Got HTTP methods
requestMethods.map(async key => {
	expectType<Got.Response<string>>(await got[key]("/"));
});

expectType<GotFunction>(got.extend());
expectType<Got.HTTPError>(new Got.HTTPError());
expectType<Got.TimeoutError>(new Got.TimeoutError());

// Test Got Instance
interface TestResponse {
	readonly foo: string;
	readonly bar: number;
}

const instance = got.extend({ json: true });

requestMethods.map(async key => {
	expectType<Got.Response<string>>(await instance[key]("/"));
});

requestMethods.map(async key => {
	expectType<Got.Response<TestResponse>>(
		await instance[key]<TestResponse>("/")
	);
});

expectType<Promise<Got.Response<TestResponse>>>(
	instance.get<TestResponse>("/")
);
