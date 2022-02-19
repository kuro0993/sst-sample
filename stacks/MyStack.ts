import * as sst from "@serverless-stack/resources";

export default class MyStack extends sst.Stack {
  constructor(scope: sst.App, id: string, props?: sst.StackProps) {
    super(scope, id, props);

    // Create notes table
    const notesTable = new sst.Table(this, "Notes", {
      fields: {
        id: sst.TableFieldType.STRING,
      },
      primaryIndex: { partitionKey: "id" },
    });

    // Create the AppSync GraqphQL API
    const api = new sst.AppSyncApi(this, "AppSyncApi", {
      graphqlApi: {
        schema: "graphql/schema.graphql",
      },
      defaultFunctionProps: {
        // Pass the table name to the function
        environment: {
          NOTES_TABLE: notesTable.dynamodbTable.tableName,
        },
      },
      dataSources: {
        notes: "src/main.handler",
      },
      resolvers: {
        "Query listNotes": "notes",
        "Query getNoteById": "notes",
        "Mutation createNote": "notes",
        "Mutation updateNote": "notes",
        "Mutation deleteNote": "notes",
      }
    });

    // Enable the AppSync API to access the DynamoDB table
    api.attachPermissions([notesTable]);

    // Show the endpoint in the output
    this.addOutputs({
      // "ApiEndpoint": api.url,
      ApiId: api.graphqlApi.apiId,
    });
  }
}
