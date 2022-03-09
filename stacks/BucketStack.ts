import * as sst from '@serverless-stack/resources';
import { EventType } from 'aws-cdk-lib/aws-s3';
import TableStack from './TableStack';
export default class BucketStack extends sst.Stack {
  public readonly bucket: sst.Bucket;
  constructor(
    scope: sst.App,
    id: string,
    auth: sst.Auth,
    tables: TableStack,
    props?: sst.StackProps
  ) {
    super(scope, id, props);

    /*
     * Create S3 Bucket
     */
    this.bucket = new sst.Bucket(this, 'Bucket', {
      // Functionのデフォルト設定
      defaultFunctionProps: {
        timeout: 20,
        environment: {
          notesTable: tables.notesTable.tableName,
          postsTable: tables.postsTable.tableName,
        },
        permissions: [tables.notesTable, tables.postsTable],
      },
      notifications: [
        {
          function: {
            handler: 'src/bucket/createObj.main',
            timeout: 10,
            // environment: { bucketName: this.bucket.bucketName },
            // permissons: [this.bucket],
          },
          notificationProps: {
            events: [EventType.OBJECT_CREATED],
            filters: [
              { prefix: 'import/' },
              { suffix: '.jpg' }
            ],
          },
        },
        {
          function: 'src/bucket/removeObj.main',
          notificationProps: {
            events: [EventType.OBJECT_REMOVED],
          },
        },
      ]
    })
    // Allow Authenticated users to access (IdPool)
    // auth.attachPermissionsForAuthUsers([this.bucket]);

    /*
     * Show the endpoint in the output
     */
    this.addOutputs({
      BucketArn: this.bucket.s3Bucket.bucketArn,
      BucketName: this.bucket.s3Bucket.bucketName,

    });
  }
}
