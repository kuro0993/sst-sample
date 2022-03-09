import * as sst from '@serverless-stack/resources';

export default class TableStack extends sst.Stack {
  public readonly notesTable: sst.Table;
  public readonly postsTable: sst.Table;
  constructor(scope: sst.App, id: string, props?: sst.StackProps) {
    super(scope, id, props);

    /*
     * Create notes table
     */
    this.notesTable = new sst.Table(this, 'Notes', {
      fields: {
        id: sst.TableFieldType.STRING,
      },
      primaryIndex: { partitionKey: 'id' },
    });
    /*
     * Create posts table
     */
    this.postsTable = new sst.Table(this, 'Posts', {
      fields: {
        id: sst.TableFieldType.STRING,
      },
      primaryIndex: { partitionKey: 'id' },
    });

    /*
     * Show the endpoint in the output
     */
    this.addOutputs({
      NotesTable: this.notesTable.dynamodbTable.tableName,
      PostsTable: this.postsTable.dynamodbTable.tableName,
    });
  }
}
