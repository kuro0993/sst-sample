import * as sst from '@serverless-stack/resources';

export default class LambdaStack extends sst.Stack {
  constructor(scope: sst.App, id: string, props?: sst.StackProps) {
    super(scope, id, props);

    new sst.Function(this, 'SampleLambda', {
      handler: 'src/lambda/sample.handler'
    });
  }
}
