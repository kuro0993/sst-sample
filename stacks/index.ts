import InfraStack from './InfraStack';
import TableStack from './TableStack';
import BucketStack from './BucketStack';
import AuthStack from './AuthStack';
import OpenSearchStack from './OpenSearchStack';
import ApiStack from './ApiStack';
import LambdaStack from './LambdaStack';
import * as sst from '@serverless-stack/resources';
import { Vpc } from 'aws-cdk-lib/aws-ec2';
import { Runtime } from 'aws-cdk-lib/aws-lambda';

export default function main(app: sst.App): void {
  // Set default runtime for all functions
  app.setDefaultFunctionProps({
    runtime: Runtime.NODEJS_14_X
  });

  const infraStack = new InfraStack(app, 'infra-stack');
  const authStack = new AuthStack(app, 'auth-stack');
  const tableStack = new TableStack(app, 'table-stack');
  new BucketStack(app, 'bucket-stack', authStack.auth, tableStack);
  const openSearch = new OpenSearchStack(app, 'opensearch-stack', infraStack.vpc);
  new ApiStack(app, 'api-stack', infraStack.vpc, tableStack, openSearch);
  new LambdaStack(app, 'lambda-stack');

}

// Debug Stack の設定
// export function debugApp(app: sst.DebugApp) {
//   const debApp = new sst.DebugStack(app, 'debug-stack', {
//     env: { // アカウント等を指定してデプロイする
//       account: 'xxx',
//       region: 'ap-northeast-1',
//     }
//   });
// }