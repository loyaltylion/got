import https from "https";
import url from "url";
import http from "http";
import FormData from "form-data";
import { CookieJar } from "tough-cookie";
import stream from "stream";

type GenericFunction = (...arguments: unknown[]) => unknown;

type RequestMethod = "GET" | "PUT" | "HEAD" | "DELETE" | "OPTIONS" | "TRACE";

/**
 * Make all properties in T required and exclude null and undefined from their
 * possible values
 */
type RequiredNonNullable<T> = { [P in keyof T]-?: NonNullable<T[P]> };

// type Got

export namespace Got {
	type RetryFunction = (retry: unknown, error: unknown) => number;

	type BeforeRequestHook = (options: object) => void;

	type Url = string | https.RequestOptions | url.URL | url.Url;

	type StreamFunction = (
		url: Url,
		options?: Options
	) => Emitter & stream.Duplex;

	interface RequestFunction<T> {
		(url: Url, options?: Options): Promise<T>;
	}

	export interface Hooks {
		/**
		 * Before the request is sent.
		 *
		 * @default []
		 */
		beforeRequest: BeforeRequestHook[];
		[hookName: string]: GenericFunction[];
	}

	export interface Timeout {
		/**
		 * Starts when a socket is assigned and ends when
		 * the hostname has been resolved.
		 * Does not apply when using a Unix domain socket.
		 */
		lookup: GenericFunction;

		/**
		 * Starts when `lookup` completes
		 * (or when the socket is assigned if lookup does not apply to the request)
		 * and ends when the socket is connected.
		 */
		connect: GenericFunction;

		/**
		 * Starts when `connect` completes and ends when
		 * the handshaking process completes (HTTPS only).
		 */
		secureConnect: GenericFunction;

		/**
		 * Starts when the socket is connected.
		 */
		socket: GenericFunction;
	}

	export interface Retry {
		/**
		 * Number of times the request should retry.
		 * @default 2
		 */
		retries?: number | RetryFunction;
		/**
		 * Allowed methods.
		 * @default ['GET' 'PUT' 'HEAD' 'DELETE' 'OPTIONS' 'TRACE']
		 */
		methods?: RequestMethod[];
		/**
		 * Allowed status codes.
		 * @default [408 413 429 500 502 503 504]
		 */
		statusCodes?: number[];
		/**
		 * Maximum retry after time.
		 * @default undefined
		 */
		maxRetryAfter?: number;
	}

	export type Agent = false | http.Agent | https.Agent;
	// | {
	// 		http?: http.Agent;
	// 		https?: https.Agent;
	//   };
	/**
	 * Any of the https.request options.
	 */

	type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;

	interface Options extends Omit<http.RequestOptions, "agent" | "timeout"> {
		/**
		 * When specified, `url` will be prepended by baseUrl.
		 * If you specify an absolute URL, it will skip the baseUrl.
		 */
		baseUrl?: string | URL;

		/**
		 * Request headers.
		 * Existing headers will be overwritten.
		 * @default {}
		 */
		headers?: http.OutgoingHttpHeaders;

		/**
		 * Returns a `Stream` instead of a `Promise`.
		 * @default false
		 */
		stream?: boolean;

		/**
		 * The body that will be sent with a `POST` request.
		 */
		body?: string | Buffer | ReadableStream | FormData;

		/**
		 * Cookie support.
		 * You don't have to care about parsing or how to store them.
		 */
		cookieJar?: CookieJar;

		/**
		 * Encoding to be used on `setEncoding` of the response data.
		 * If `null`, the body is returned as a `Buffer`
		 * @default 'utf8'
		 */
		encoding?: string | null;

		/**
		 * If set to `true` and `Content-Type` header is not set,
		 * it will be set to `application/x-www-form-urlencoded`.
		 * @default false
		 */
		form?: boolean;

		/**
		 * If set to `true` and `Content-Type` header is not set,
		 * it will be set to `application/json`.
		 * @default false
		 */
		json?: boolean;

		/**
		 * Query string object that will be added to the request URL.
		 * This will override the query string in `url`.
		 */
		query?: string | { [key: string]: unknown } | URLSearchParams;

		/**
		 * Milliseconds to wait for the server to end the response
		 * before aborting the request with `TimeoutError`
		 */
		timeout?: number | Timeout;

		/**
		 * Represents the retry behavior
		 */
		retry?: number | Retry;

		/**
		 * Defines if redirect responses should be followed automatically.
		 * @default true
		 */
		followRedirect?: boolean;

		/**
		 * Decompress the response automatically.
		 * This will set the `accept-encoding` header to `gzip, deflate` unless you set it yourself.
		 * @default true
		 */
		decompress?: boolean;

		/**
		 * Cache adapter instace for storing cached data.
		 * @default false
		 */
		cache?: false | Map<unknown, unknown>;

		/**
		 * Custom request function
		 * @default `http.request` `https.request` *(depending on the protocol)*
		 */
		request?: http.ClientRequest | GenericFunction;

		/**
		 * When used in Electron, Got will use
		 * [`electron.net`](https://electronjs.org/docs/api/net/) instead of the Node.js `http` module.
		 * @default false
		 */
		useElectron?: boolean;

		/**
		 * Determines if a `got.HTTPError` is thrown for error responses (non-2xx status codes).
		 * @default true
		 */
		throwHttpErrors?: boolean;

		/**
		 * Same as the [`agent` option](https://nodejs.org/api/http.html#http_http_request_url_options_callback)
		 * for `http.request`, but with an extra feature: If you require different agents for different protocols,
		 * you can pass a map of agents to the `agent` option. This is necessary because a request to one protocol might redirect to another.
		 * In such a scenario, Got will switch over to the right protocol agent for you.
		 */
		agent?: Agent;

		/**
		 * Hooks allow modifications during the request lifecycle.
		 * Hook functions may be async and are run serially.
		 */
		hooks?: Hooks;
	}

	type JsonBodyOptions = Got.Options & { json: true };

	type StringBodyOptions = Got.Options & { json: false };

	export type Stream = {
		on(event: "request", listener: (req: http.ClientRequest) => void): unknown;
	} & stream.Duplex;

	export interface Response<T> {
		/**
		 * The result of the request.
		 */
		body: T;
		/**
		 * The request URL or the final URL after redirects.
		 */
		url: string;
		/**
		 * The original request URL.
		 */
		requestUrl: string;
		timings: {
			/**
			 * Time when the request started.
			 */
			start: number;
			/**
			 * Time when a socket was assigned to the request.
			 */
			socket: number;
			/**
			 * Time when the DNS lookup finished.
			 */
			lookup: number;
			/**
			 * Time when the socket successfully connected.
			 */
			connect: number;
			/**
			 * Time when the request finished uploadin.
			 */
			upload: number;
			/**
			 * Time when the request fired the `response` event.
			 */
			response: number;
			/**
			 * Time when the response fired the `end` event
			 */
			end: number;
			/**
			 * Time when the request fired the `error` event
			 */
			error: number;
			/**
			 * The time is a `number` representing the milliseconds elapsed since the UNIX epoch.
			 */
			phases: {
				/**
				 * `timings.socket - timings.start`
				 */
				wait: number;
				/**
				 * `timings.lookup - timings.socket`
				 */
				dns: number;
				/**
				 * `timings.connect - timings.lookup`
				 */
				tcp: number;
				/**
				 * `timings.upload - timings.connect`
				 */
				request: number;
				/**
				 * `timings.response - timings.upload`
				 */
				firstByte: number;
				/**
				 * `timings.end - timings.response`
				 */
				download: number;
				/**
				 * `timings.end - timings.start` or `timings.error - timings.start`
				 */
				total: number;
			};
			/**
			 * Whether the response was retrieved from the cache.
			 */
			fromCache: boolean;
			/**
			 * The redirect URLs.
			 */
			redirectUrls: string[];
			/**
			 * The number of times the request was retried.
			 */
			retryCount: number;
		};
	}

	interface Progress {
		percent: number;
		transferred: number;
		total: number | null;
	}

	interface Emitter {
		addListener(
			event: "request",
			listener: (req: http.ClientRequest) => void
		): this;
		addListener(
			event: "response",
			listener: (res: http.IncomingMessage) => void
		): this;
		addListener(
			event: "redirect",
			listener: (res: http.IncomingMessage, nextOptions: Options & Url) => void
		): this;
		addListener(
			event: "error",
			listener: (
				error: GotError,
				body?: unknown,
				res?: http.IncomingMessage
			) => void
		): this;
		addListener(
			event: "downloadProgress",
			listener: (progress: Progress) => void
		): this;
		addListener(
			event: "uploadProgress",
			listener: (progress: Progress) => void
		): this;

		on(event: "request", listener: (req: http.ClientRequest) => void): this;
		on(event: "response", listener: (res: http.IncomingMessage) => void): this;
		on(
			event: "redirect",
			listener: (res: http.IncomingMessage, nextOptions: Options & Url) => void
		): this;
		on(
			event: "error",
			listener: (
				error: GotError,
				body?: unknown,
				res?: http.IncomingMessage
			) => void
		): this;
		on(event: "downloadProgress", listener: (progress: Progress) => void): this;
		on(event: "uploadProgress", listener: (progress: Progress) => void): this;

		once(event: "request", listener: (req: http.ClientRequest) => void): this;
		once(
			event: "response",
			listener: (res: http.IncomingMessage) => void
		): this;
		once(
			event: "redirect",
			listener: (res: http.IncomingMessage, nextOptions: Options & Url) => void
		): this;
		once(
			event: "error",
			listener: (
				error: GotError,
				body?: unknown,
				res?: http.IncomingMessage
			) => void
		): this;
		once(
			event: "downloadProgress",
			listener: (progress: Progress) => void
		): this;
		once(event: "uploadProgress", listener: (progress: Progress) => void): this;

		prependListener(
			event: "request",
			listener: (req: http.ClientRequest) => void
		): this;
		prependListener(
			event: "response",
			listener: (res: http.IncomingMessage) => void
		): this;
		prependListener(
			event: "redirect",
			listener: (res: http.IncomingMessage, nextOptions: Options & Url) => void
		): this;
		prependListener(
			event: "error",
			listener: (
				error: GotError,
				body?: unknown,
				res?: http.IncomingMessage
			) => void
		): this;
		prependListener(
			event: "downloadProgress",
			listener: (progress: Progress) => void
		): this;
		prependListener(
			event: "uploadProgress",
			listener: (progress: Progress) => void
		): this;

		prependOnceListener(
			event: "request",
			listener: (req: http.ClientRequest) => void
		): this;
		prependOnceListener(
			event: "response",
			listener: (res: http.IncomingMessage) => void
		): this;
		prependOnceListener(
			event: "redirect",
			listener: (res: http.IncomingMessage, nextOptions: Options & Url) => void
		): this;
		prependOnceListener(
			event: "error",
			listener: (
				error: GotError,
				body?: unknown,
				res?: http.IncomingMessage
			) => void
		): this;
		prependOnceListener(
			event: "downloadProgress",
			listener: (progress: Progress) => void
		): this;
		prependOnceListener(
			event: "uploadProgress",
			listener: (progress: Progress) => void
		): this;

		removeListener(
			event: "request",
			listener: (req: http.ClientRequest) => void
		): this;
		removeListener(
			event: "response",
			listener: (res: http.IncomingMessage) => void
		): this;
		removeListener(
			event: "redirect",
			listener: (res: http.IncomingMessage, nextOptions: Options & Url) => void
		): this;
		removeListener(
			event: "error",
			listener: (
				error: GotError,
				body?: unknown,
				res?: http.IncomingMessage
			) => void
		): this;
		removeListener(
			event: "downloadProgress",
			listener: (progress: Progress) => void
		): this;
		removeListener(
			event: "uploadProgress",
			listener: (progress: Progress) => void
		): this;
	}
}

declare class GotError extends Error {
	constructor(message: string, error: { code?: number }, opts: any)
	code: string;
	host: string;
	hostname: string;
	method: string;
	path: string;
	socketPath: string;
	protocol: string;
	url: string;
	response?: unknown;
}

export class CacheError extends GotError {
	name: "CacheError";
}

export class RequestError extends GotError {
	code: string;
	name: "RequestError";
}

export class ReadError extends GotError {
	name: "ReadError";
}

export class ParseError extends GotError {
	name: "ParseError";
	statusCode: number;
	statusMessage: string;
}

export class HTTPError extends GotError {
	constructor(response: { statusCode: number, statusMessage: string }, options: any)
	name: "HTTPError";
	statusCode: number;
	statusMessage: string;
	body: unknown;
	headers: http.IncomingHttpHeaders;
}

export class MaxRedirectsError extends GotError {
	name: "MaxRedirectsError";
	statusCode: number;
	statusMessage: string;
	redirectUrls: string[];
}

export class UnsupportedProtocolError extends GotError {
	name: "UnsupportedProtocolError";
}

export class CancelError extends GotError {
	name: "CancelError";
}

export class TimeoutError extends GotError {
	name: "TimeoutError";
}

interface BaseGotFunction {
	GotError: typeof GotError;
	CacheError: typeof CacheError;
	RequestError: typeof RequestError;
	ReadError: typeof ReadError;
	ParseError: typeof ParseError;
	HTTPError: typeof HTTPError;
	MaxRedirectsError: typeof MaxRedirectsError;
	UnsupportedProtocolError: typeof UnsupportedProtocolError;
	CancelError: typeof CancelError;
	TimeoutError: typeof TimeoutError;
	<ResponseBodyType = unknown>(
		url: Got.Url,
		options: Got.Options & { json: true }
	): Promise<Got.Response<ResponseBodyType>>;
	(url: Got.Url, options?: Got.Options): Promise<Got.Response<string>>;
	/**
	 * Sets `options.stream` to `true`.
	 */
	stream: Got.StreamFunction;
	get<ResponseBodyType = unknown>(
		url: Got.Url,
		options: Got.JsonBodyOptions
	): Promise<Got.Response<ResponseBodyType>>;
	post<ResponseBodyType = unknown>(
		url: Got.Url,
		options: Got.JsonBodyOptions
	): Promise<Got.Response<ResponseBodyType>>;
	put<ResponseBodyType = unknown>(
		url: Got.Url,
		options: Got.JsonBodyOptions
	): Promise<Got.Response<ResponseBodyType>>;
	patch<ResponseBodyType = unknown>(
		url: Got.Url,
		options: Got.JsonBodyOptions
	): Promise<Got.Response<ResponseBodyType>>;
	head<ResponseBodyType = unknown>(
		url: Got.Url,
		options: Got.JsonBodyOptions
	): Promise<Got.Response<ResponseBodyType>>;
	delete<ResponseBodyType = unknown>(
		url: Got.Url,
		options: Got.JsonBodyOptions
	): Promise<Got.Response<ResponseBodyType>>;
	get(url: Got.Url, options?: Got.Options): Promise<Got.Response<string>>;
	post(url: Got.Url, options?: Got.Options): Promise<Got.Response<string>>;
	put(url: Got.Url, options?: Got.Options): Promise<Got.Response<string>>;
	patch(url: Got.Url, options?: Got.Options): Promise<Got.Response<string>>;
	head(url: Got.Url, options?: Got.Options): Promise<Got.Response<string>>;
	delete(url: Got.Url, options?: Got.Options): Promise<Got.Response<string>>;
	extend(options: Got.JsonBodyOptions): GotFunction.JSONResponseBody;
	extend(
		options?: Got.Options
	): GotFunction.Base | GotFunction.JSONResponseBody;
	defaults: {
		options: RequiredNonNullable<Got.Options>;
	};
}

interface GotJsonResponseFunction extends BaseGotFunction {
	(url: Got.Url, options: Got.StringBodyOptions): Promise<Got.Response<string>>;
	<ResponseBodyType = unknown>(url: Got.Url, options?: Got.Options): Promise<
		Got.Response<ResponseBodyType>
	>;
	get<ResponseBodyType = unknown>(
		url: Got.Url,
		options: Got.StringBodyOptions
	): Promise<Got.Response<string>>;
	post<ResponseBodyType = unknown>(
		url: Got.Url,
		options: Got.StringBodyOptions
	): Promise<Got.Response<string>>;
	put<ResponseBodyType = unknown>(
		url: Got.Url,
		options: Got.StringBodyOptions
	): Promise<Got.Response<string>>;
	patch<ResponseBodyType = unknown>(
		url: Got.Url,
		options: Got.StringBodyOptions
	): Promise<Got.Response<string>>;
	head<ResponseBodyType = unknown>(
		url: Got.Url,
		options: Got.StringBodyOptions
	): Promise<Got.Response<string>>;
	delete<ResponseBodyType = unknown>(
		url: Got.Url,
		options: Got.StringBodyOptions
	): Promise<Got.Response<string>>;
	get<ResponseBodyType = unknown>(
		url: Got.Url,
		options?: Got.Options
	): Promise<Got.Response<ResponseBodyType>>;
	post<ResponseBodyType = unknown>(
		url: Got.Url,
		options?: Got.Options
	): Promise<Got.Response<ResponseBodyType>>;
	put<ResponseBodyType = unknown>(
		url: Got.Url,
		options?: Got.Options
	): Promise<Got.Response<ResponseBodyType>>;
	patch<ResponseBodyType = unknown>(
		url: Got.Url,
		options?: Got.Options
	): Promise<Got.Response<ResponseBodyType>>;
	head<ResponseBodyType = unknown>(
		url: Got.Url,
		options?: Got.Options
	): Promise<Got.Response<ResponseBodyType>>;
	delete<ResponseBodyType = unknown>(
		url: Got.Url,
		options?: Got.Options
	): Promise<Got.Response<ResponseBodyType>>;
	extend(options: Got.StringBodyOptions): BaseGotFunction;
	extend(options?: Got.Options): BaseGotFunction | GotJsonResponseFunction;
}

export namespace GotFunction {
	type Base = BaseGotFunction;
	type JSONResponseBody = GotJsonResponseFunction;
}

declare const got: BaseGotFunction;

export default got;
