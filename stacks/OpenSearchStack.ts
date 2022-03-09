import * as sst from '@serverless-stack/resources';
import { IVpc } from 'aws-cdk-lib/aws-ec2';
import * as opensearch from 'aws-cdk-lib/aws-opensearchservice';

export default class OpenSearchStack extends sst.Stack {

  public readonly osDomain: opensearch.Domain;

  constructor(scope: sst.App, id: string, vpc: IVpc, props?: sst.StackProps) {
    super(scope, id, props);

    /*
     * Create OpenSearch
     * https://docs.aws.amazon.com/cdk/api/v2/docs/aws-cdk-lib.aws_opensearchservice-readme.html
     */
    /** 共通設定 */
    const domainProps_shared: opensearch.DomainProps = {
      version: opensearch.EngineVersion.OPENSEARCH_1_0,
      // vpc, // VPCにデプロイ。ダッシュボードのアクセスにはポートフォワードが必要
      enforceHttps: true,
      encryptionAtRest: {
        enabled: true,
      },
      fineGrainedAccessControl: {
        masterUserName: 'admin',
      },
      nodeToNodeEncryption: true,
      logging: {
        slowSearchLogEnabled: true,
        appLogEnabled: true,
        slowIndexLogEnabled: true,
      },
    }
    /** 本番用 */
    const domainProps_prod: opensearch.DomainProps = {
      ...domainProps_shared,
      // domainName: 'sst-sample-opensearch',
      ebs: {
        volumeSize: 10,
      },
      capacity: {
        /*
         * masterNodes: 2,
         * masterNodeInstanceType: 't3.small.search',
         */
        dataNodes: 1,
        dataNodeInstanceType: 't3.small.search',
      },
    };
    /** 開発用 */
    const domainProps_dev: opensearch.DomainProps = {
      ...domainProps_shared,
      // domainName: 'sst-sample-opensearch',
      ebs: {
        volumeSize: 10,
      },
      capacity: {
        /*
         * masterNodes: 2,
         * masterNodeInstanceType: 't3.small.search',
         */
        dataNodes: 1,
        dataNodeInstanceType: 't3.small.search',
      },
      /*
       * zoneAwareness: {
       *   availabilityZoneCount: 2,
       * },
       */
    };
    if (scope.stage == 'prod') {
      this.osDomain = new opensearch.Domain(this, 'Domain', domainProps_prod)
    } else {
      this.osDomain = new opensearch.Domain(this, 'Domain', domainProps_dev)
    }

    /*
     * Create DataSource OpenSearch
     */
    /*
     * const dsOpenSearch = new CfnDataSource(this, 'MyCfnDataSource', {
     *   apiId: api.graphqlApi.apiId,
     *   name: 'searchNote',
     *   type: 'AMAZON_OPENSEARCH_SERVICE',
     *   description: 'Opensearch DataSource',
     *   openSearchServiceConfig: {
     *     awsRegion: osDomain.env.region,
     *     endpoint: osDomain.domainEndpoint
     *   },
     * });
     */
    // dsOpenSearch.addDependsOn(osDomain as CfnResource);

    /*
     * Add Resolver OpenSearch
     * https://docs.aws.amazon.com/cdk/api/v2/docs/aws-cdk-lib.aws_appsync.CfnResolver.html
     */
    /*
     * const searchNoteResolver = new CfnResolver(this, 'MyCfnResolver', {
     *   apiId: api.graphqlApi.apiId,
     *   typeName: 'Query',                    // アタッチするSchemaの型
     *   fieldName: 'searchNote',              // アタッチする型のフィールド
     *   dataSourceName: dsOpenSearch.name,
     * })
     */

    /*
     * Show the endpoint in the output
     */
    this.addOutputs({
      osDomainArn: this.osDomain.domainArn,
      osDomainEndpoint: this.osDomain.domainEndpoint,
      osDomainName: this.osDomain.domainName,
    });
  }
}
