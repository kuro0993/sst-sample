import * as sst from '@serverless-stack/resources';
import { MappingTemplate } from '@aws-cdk/aws-appsync-alpha'

export default class MyStack extends sst.Stack {
  constructor(scope: sst.App, id: string, props?: sst.StackProps) {
    super(scope, id, props);

    // Create notes table
    const notesTable = new sst.Table(this, 'Notes', {
      fields: {
        id: sst.TableFieldType.STRING,
      },
      primaryIndex: { partitionKey: 'id' },
    });
    // Create posts table
    const postsTable = new sst.Table(this, 'Posts', {
      fields: {
        id: sst.TableFieldType.STRING,
      },
      primaryIndex: { partitionKey: 'id' },
    });

    // Create the AppSync GraqphQL API
    const api = new sst.AppSyncApi(this, 'AppSyncApi', {
      graphqlApi: {
        schema: 'graphql/schema.graphql',
      },
      defaultFunctionProps: {
        // Pass the table name to the function
        environment: {
          NOTES_TABLE: notesTable.dynamodbTable.tableName,
          POSTS_TABLE: postsTable.dynamodbTable.tableName,
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
        posts: { table: postsTable },
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
      }
    });

    // Enable the AppSync API to access the DynamoDB table
    api.attachPermissions([notesTable]);
    api.attachPermissions([postsTable]);

    // Show the endpoint in the output
    this.addOutputs({
      // 'ApiEndpoint': api.url,
      ApiId: api.graphqlApi.apiId,
    });
  }
}
