import Note from './Note';
import { HttpRequest } from '@aws-sdk/protocol-http';
import { defaultProvider } from '@aws-sdk/credential-provider-node';
import { SignatureV4 } from '@aws-sdk/signature-v4';
import { NodeHttpHandler } from '@aws-sdk/node-http-handler';
import { Sha256 } from '@aws-crypto/sha256-browser';

const region = 'ap-northeast-1'; // e.g. us-west-1
const domain = 'search-domain.region.es.amazonaws.com'; // e.g. search-domain.region.es.amazonaws.com
const index = 'node-test';
const type = '_doc';
const id = '1';
const doc = {
  "title": "Moneyball",
  "director": "Bennett Miller",
  "year": "2011"
};


searchNote(doc).then(v => {
  console.log(v);
});

export default async function searchNote(document: any): Promise<any> {


  const request = new HttpRequest({
    body: JSON.stringify(document),
    headers: {
      'Content-Type': 'application/json',
      'host': domain
    },
    hostname: domain,
    method: 'GET',
    path: index + '/' + type + '/' + id
  });

  const signer = new SignatureV4({
    credentials: defaultProvider(),
    region: region,
    service: 'es',
    sha256: Sha256
  });
  const signedRequest = await signer.sign(request);

  const client = new NodeHttpHandler();
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const { response } = await client.handle(signedRequest);
  console.log(response.statusCode + ' ' + response.body.statusMessage);
  return response;
}


