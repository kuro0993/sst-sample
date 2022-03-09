import Note from './Note';
import listNotes from './listNotes';
import createNote from './createNote';
import updateNote from './updateNote';
import deleteNote from './deleteNote';
import getNoteById from './getNoteById';
import searchNote from './searchNote';

type AppSyncEvent = {
  info: {
    fieldName: string;
  };
  arguments: {
    note: Note;
    noteId: string;
    keyword: string;
  },
};

export async function handler(
  event: AppSyncEvent
): Promise<Record<string, unknown>[] | Note | string | null | undefined> {
  console.log('event:', event);
  switch (event.info.fieldName) {
    case 'listNotes':
      console.log('call listNote');
      return await listNotes();
    case 'createNote':
      console.log('call createNote');
      return await createNote(event.arguments.note);
    case 'updateNote':
      console.log('call updateNote');
      return await updateNote(event.arguments.note);
    case 'deleteNote':
      console.log('call deleteNote');
      return await deleteNote(event.arguments.noteId);
    case 'getNoteById':
      console.log('call getNoteById');
      return await getNoteById(event.arguments.noteId);
    case 'searchNote':
      console.log('call searchNote');
      return await searchNote(event.arguments.keyword);
    default:
      console.log('default');
      return null;
  }
}
