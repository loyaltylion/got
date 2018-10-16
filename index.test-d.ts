import { expectType } from "tsd-check";
import got, { Got, GotFunction } from ".";
import { createServer } from "./test/helpers/server";
import { HTTPError, TimeoutError } from ".";

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

	expectType<Promise<Got.Response<string>>>(got(serverUrl));
});

// Test Got
type RequestMethod = keyof Pick<
	GotFunction.Base,
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

expectType<HTTPError>(new got.HTTPError());
expectType<TimeoutError>(new got.TimeoutError());

expectType<GotFunction.Base>(got.extend());

const jsonBodyInstance = got.extend({ json: true });

// Got on it's own
jsonBodyInstance<{ id: number }>("example.com").then(res => {
	expectType<{ id: number }>(res.body);
});

jsonBodyInstance("example.com").then(res => {
	expectType<unknown>(res.body);
});

jsonBodyInstance("example.com", { json: false }).then(res => {
	expectType<string>(res.body);
});

// Got HTTP methods

requestMethods.map(async key => {
	expectType<Got.Response<unknown>>(await jsonBodyInstance[key]("/"));
});

// With a type arg

requestMethods.map(async key => {
	expectType<Got.Response<{ id: number }>>(
		await jsonBodyInstance[key]<{ id: number }>("/")
	);
});

// When json option is overridden

requestMethods.map(async key => {
	expectType<Got.Response<string>>(
		await jsonBodyInstance[key]("/", { json: false })
	);
});

// still returns a string body even with type arg

requestMethods.map(async key => {
	expectType<Got.Response<string>>(
		await jsonBodyInstance[key]<{ id: number }>("/", { json: false })
	);
});

// calling extend on a GotJsonResponseFunction

expectType<GotFunction.JSONResponseBody>(jsonBodyInstance.extend());

expectType<GotFunction.Base>(jsonBodyInstance.extend({ json: false }));

// calling got directly

got("example.com").then(response => {
	// got defaults to a string response.body without any options
	expectType<string>(response.body);
});

got<{ id: number }>("example.com", { json: true }).then(response => {
	expectType<{ id: number }>(response.body);
});
