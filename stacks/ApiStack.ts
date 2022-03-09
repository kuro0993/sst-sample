import { AuthorizationType, MappingTemplate, FieldLogLevel } from '@aws-cdk/aws-appsync-alpha';
import * as sst from '@serverless-stack/resources';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import { CfnDataSource, CfnResolver } from 'aws-cdk-lib/aws-appsync';
import { IVpc } from 'aws-cdk-lib/aws-ec2';
import TableStack from './TableStack';
import OpenSearchStack from './OpenSearchStack';

export default class ApiStack extends sst.Stack {
  public readonly api: sst.AppSyncApi;
  constructor(scope: sst.App, id: string, vpc: IVpc, tables: TableStack, openSearch: OpenSearchStack, props?: sst.StackProps) {
    super(scope, id, props);

    /*
     * Create the AppSync GraqphQL API
     */
    this.api = new sst.AppSyncApi(this, 'AppSyncApi', {
      graphqlApi: {
        schema: 'graphql/schema.graphql',
        // authorizationConfig: {
        //   defaultAuthorization: {
        //     authorizationType: AuthorizationType.USER_POOL,
        //     userPoolConfig: {
        //       userPool: auth.cognitoUserPool,
        //     }
        //   }
        // }
        logConfig: {
          excludeVerboseContent: false,
          fieldLogLevel: FieldLogLevel.ALL,
        },

      },
      defaultFunctionProps: {
        // Pass the table name to the function
        environment: {
          NOTES_TABLE: tables.notesTable.dynamodbTable.tableName,
          POSTS_TABLE: tables.postsTable.dynamodbTable.tableName,
          OS_DOMAIN_ENDPOINT: openSearch.osDomain.domainEndpoint,
        },
        // timeout: 10,
      },
      dataSources: {
        // Lambda Resolver Sample
        notes: {
          function: {
            handler: 'src/api/notes/main.handler',
            // timeout: 10,
          },
        },
        greet: {
          function: {
            handler: 'src/api/greet/main.handler',
            // timeout: 10,
          },
        },
        // Mapping Tamplate Sample
        posts: { table: tables.postsTable },
      },
      resolvers: {
        'Query getGreet': 'greet',
        'Query listNotes': 'notes',
        'Query getNoteById': 'notes',
        // Mapping Tamplate Sample
        'Query getPost': {
          dataSource: 'posts',
          resolverProps: {
            requestMappingTemplate: MappingTemplate.fromFile('src/api/posts/QueryGetPost.req.vtl'),
            responseMappingTemplate: MappingTemplate.fromFile('src/api/posts/QueryGetPost.res.vtl'),
          }
        },
        'Query searchNote': 'notes', // lambda からOpenSearchをコール
        'Mutation createNote': 'notes',
        'Mutation updateNote': 'notes',
        'Mutation deleteNote': 'notes',
        // Mapping Tamplate Sample
        'Mutation createPost': {
          dataSource: 'posts',
          resolverProps: {
            requestMappingTemplate: MappingTemplate.fromFile('src/api/posts/MutationCreatePost.req.vtl'),
            responseMappingTemplate: MappingTemplate.fromFile('src/api/posts/MutationCreatePost.res.vtl'),
          }
        },
        'Mutation updatePost': {
          dataSource: 'posts',
          resolverProps: {
            requestMappingTemplate: MappingTemplate.fromFile('src/api/posts/MutationUpdatePost.req.vtl'),
            responseMappingTemplate: MappingTemplate.fromFile('src/api/posts/MutationUpdatePost.res.vtl'),
          }
        },
      }
    });

    // Enable the AppSync API to access the DynamoDB table
    this.api.attachPermissions([tables.notesTable]);
    this.api.attachPermissions([tables.postsTable]);
    // this.api.attachPermissionsToDataSource("Query searchNote", ["s3"]); // リゾルバに毎に権限を付与
    // this.api.attachPermissionsToDataSource("posts", ["s3"]); // DS毎に権限を付与



    /*
     * Create SNS Topic
     */

    /*
     * Show the endpoint in the output
     */
    this.addOutputs({
      // 'ApiEndpoint': this.api.url,
      ApiId: this.api.graphqlApi.apiId,
      Region: scope.region,
    });
  }
}
