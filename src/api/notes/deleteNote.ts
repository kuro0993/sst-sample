import { DynamoDB } from 'aws-sdk';
import Note from './Note';

const dynamoDb = new DynamoDB.DocumentClient();

export default async function deleteNote(noteId: string): Promise<string> {
  const params = {
    Key: { id: noteId },
    TableName: process.env.NOTES_TABLE as string,
  };

  await dynamoDb.delete(params).promise();

  return noteId;
}
