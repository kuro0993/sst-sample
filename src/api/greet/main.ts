import Greet from './Greet';

export async function handler(): Promise<Greet> {
  const index = Math.floor(Math.random() * 4);
  const greets = ['Good morning', 'Good evening', 'Good night', 'Hello'];
  console.log('greet:', index, greets[index]);
  return { greet: greets[index] };
}
