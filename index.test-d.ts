import { expectType } from 'tsd-check';
import got, { Got, HTTPError, TimeoutError, ResponsePromise, Hooks } from '.';
import { createServer } from './test/helpers/server';

const server = await createServer() as any;

server.on('/', (request, response) => {
  response.end();
});

server.on('/timeout', (request, response) => {
  setTimeout(() => response.end(), 11000);
});


// Test Got
expectType<ResponsePromise>(got(server.url));

const requestMethods = [
  'get',
  'post',
  'put',
  'patch',
  'head',
  'delete'
];

// Test Got HTTP methods
requestMethods.map(async (key) => {
  expectType<ResponsePromise>(await got[key]());
});

expectType<Got>(got.extend({}));
expectType<HTTPError>(new HTTPError());
expectType<TimeoutError>(new TimeoutError);

got(server.url, {
  hooks: {
    beforeRequest: [
      options => {
        expectType<Object>(options);
      }
    ]
  }
});