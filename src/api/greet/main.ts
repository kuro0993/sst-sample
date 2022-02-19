import Greet from './Greet';

export async function handler(): Greet {
  const index = Math.floor(Math.random() * 4);
  const greets = ['Good morning', 'Good evening', 'Good night', 'Hello'];
  return { greet: greets[index] };
}
