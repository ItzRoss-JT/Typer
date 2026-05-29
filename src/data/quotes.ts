/*
 * Quotes for free practice. Curated mix of short maxims, mid-length thoughts,
 * and longer paragraphs so the 15s/30s/60s/120s timers all have appropriate
 * content. Public-domain or original. ~60 entries.
 */
import type { Quote } from '../types';

export const QUOTES: Quote[] = [
  // Short (good for 15s tests)
  { id: 'q-001', text: 'The journey of a thousand miles begins with a single step.', attribution: 'Lao Tzu' },
  { id: 'q-002', text: 'What we think, we become.', attribution: 'Buddha' },
  { id: 'q-003', text: 'In the middle of every difficulty lies opportunity.', attribution: 'Albert Einstein' },
  { id: 'q-004', text: 'Simplicity is the ultimate sophistication.', attribution: 'Leonardo da Vinci' },
  { id: 'q-005', text: 'Quality is not an act, it is a habit.', attribution: 'Aristotle' },
  { id: 'q-006', text: 'The only way to do great work is to love what you do.' },
  { id: 'q-007', text: 'It always seems impossible until it is done.', attribution: 'Nelson Mandela' },
  { id: 'q-008', text: 'Whether you think you can or you think you cannot, you are right.', attribution: 'Henry Ford' },
  { id: 'q-009', text: 'Do not count the days, make the days count.' },
  { id: 'q-010', text: 'The best time to plant a tree was twenty years ago. The second best time is now.' },
  { id: 'q-011', text: 'Be yourself, everyone else is already taken.', attribution: 'Oscar Wilde' },
  { id: 'q-012', text: 'A room without books is like a body without a soul.', attribution: 'Cicero' },

  // Medium (30s / 60s)
  { id: 'q-013', text: 'It is our choices that show what we truly are, far more than our abilities.', attribution: 'J. K. Rowling' },
  { id: 'q-014', text: 'The world breaks everyone, and afterward, many are strong at the broken places.', attribution: 'Ernest Hemingway' },
  { id: 'q-015', text: 'Not all those who wander are lost. Some of them are just buying coffee.' },
  { id: 'q-016', text: 'You miss one hundred percent of the shots you do not take.', attribution: 'Wayne Gretzky' },
  { id: 'q-017', text: 'Programs must be written for people to read, and only incidentally for machines to execute.', attribution: 'Harold Abelson' },
  { id: 'q-018', text: 'Any fool can write code that a computer can understand. Good programmers write code that humans can understand.', attribution: 'Martin Fowler' },
  { id: 'q-019', text: 'The best way to predict the future is to invent it.', attribution: 'Alan Kay' },
  { id: 'q-020', text: 'A user interface is like a joke. If you have to explain it, it is not that good.', attribution: 'Martin LeBlanc' },
  { id: 'q-021', text: 'I have not failed. I have just found ten thousand ways that will not work.', attribution: 'Thomas Edison' },
  { id: 'q-022', text: 'You have to learn the rules of the game. And then you have to play better than anyone else.', attribution: 'Albert Einstein' },
  { id: 'q-023', text: 'Two roads diverged in a wood, and I took the one less traveled by, and that has made all the difference.', attribution: 'Robert Frost' },
  { id: 'q-024', text: 'We accept the reality of the world with which we are presented. It is as simple as that.', attribution: 'Christof, The Truman Show' },

  // Longer (60s / 120s) — adapted public-domain paragraphs
  {
    id: 'q-025',
    text: 'It was the best of times, it was the worst of times, it was the age of wisdom, it was the age of foolishness, it was the epoch of belief, it was the epoch of incredulity.',
    attribution: 'Charles Dickens',
  },
  {
    id: 'q-026',
    text: 'All happy families are alike; each unhappy family is unhappy in its own way. Everything was in confusion in the house of the Oblonskys.',
    attribution: 'Leo Tolstoy',
  },
  {
    id: 'q-027',
    text: 'Call me Ishmael. Some years ago, never mind how long precisely, having little or no money in my purse, and nothing particular to interest me on shore, I thought I would sail about a little.',
    attribution: 'Herman Melville',
  },
  {
    id: 'q-028',
    text: 'It is a truth universally acknowledged, that a single man in possession of a good fortune, must be in want of a wife.',
    attribution: 'Jane Austen',
  },
  {
    id: 'q-029',
    text: 'In the beginning, the universe was created. This has made a lot of people very angry and been widely regarded as a bad move.',
    attribution: 'Douglas Adams',
  },
  {
    id: 'q-030',
    text: 'A wizard is never late, nor is he early. He arrives precisely when he means to.',
    attribution: 'J. R. R. Tolkien',
  },
  {
    id: 'q-031',
    text: 'You can never get a cup of tea large enough or a book long enough to suit me.',
    attribution: 'C. S. Lewis',
  },
  {
    id: 'q-032',
    text: 'There is nothing either good or bad, but thinking makes it so.',
    attribution: 'William Shakespeare',
  },
  {
    id: 'q-033',
    text: 'A reader lives a thousand lives before he dies. The man who never reads lives only one.',
    attribution: 'George R. R. Martin',
  },
  {
    id: 'q-034',
    text: 'The mind is everything. What you think, you become.',
    attribution: 'Buddha',
  },
  {
    id: 'q-035',
    text: 'The way to get started is to quit talking and begin doing.',
    attribution: 'Walt Disney',
  },
  {
    id: 'q-036',
    text: 'If you set your goals ridiculously high and it is a failure, you will fail above everyone else success.',
    attribution: 'James Cameron',
  },
  {
    id: 'q-037',
    text: 'The only impossible journey is the one you never begin.',
    attribution: 'Tony Robbins',
  },
  {
    id: 'q-038',
    text: 'Life is what happens when you are busy making other plans.',
    attribution: 'John Lennon',
  },
  {
    id: 'q-039',
    text: 'Spread love everywhere you go. Let no one ever come to you without leaving happier.',
    attribution: 'Mother Teresa',
  },
  {
    id: 'q-040',
    text: 'When you reach the end of your rope, tie a knot in it and hang on.',
    attribution: 'Franklin D. Roosevelt',
  },
  {
    id: 'q-041',
    text: 'Always remember that you are absolutely unique. Just like everyone else.',
    attribution: 'Margaret Mead',
  },
  {
    id: 'q-042',
    text: 'The future belongs to those who believe in the beauty of their dreams.',
    attribution: 'Eleanor Roosevelt',
  },
  {
    id: 'q-043',
    text: 'Tell me and I forget. Teach me and I remember. Involve me and I learn.',
    attribution: 'Benjamin Franklin',
  },
  {
    id: 'q-044',
    text: 'The best and most beautiful things in the world cannot be seen or even touched, they must be felt with the heart.',
    attribution: 'Helen Keller',
  },
  {
    id: 'q-045',
    text: 'It is during our darkest moments that we must focus to see the light.',
    attribution: 'Aristotle',
  },
  {
    id: 'q-046',
    text: 'Do not go where the path may lead, go instead where there is no path and leave a trail.',
    attribution: 'Ralph Waldo Emerson',
  },
  {
    id: 'q-047',
    text: 'You will face many defeats in life, but never let yourself be defeated.',
    attribution: 'Maya Angelou',
  },
  {
    id: 'q-048',
    text: 'In the end, it is not the years in your life that count. It is the life in your years.',
    attribution: 'Abraham Lincoln',
  },
  {
    id: 'q-049',
    text: 'Never let the fear of striking out keep you from playing the game.',
    attribution: 'Babe Ruth',
  },
  {
    id: 'q-050',
    text: 'Life is either a daring adventure or nothing at all.',
    attribution: 'Helen Keller',
  },
  {
    id: 'q-051',
    text: 'Many of life failures are people who did not realize how close they were to success when they gave up.',
    attribution: 'Thomas Edison',
  },
  {
    id: 'q-052',
    text: 'The greatest glory in living lies not in never falling, but in rising every time we fall.',
    attribution: 'Nelson Mandela',
  },
  {
    id: 'q-053',
    text: 'I am not afraid of storms, for I am learning how to sail my ship.',
    attribution: 'Louisa May Alcott',
  },
  {
    id: 'q-054',
    text: 'The only person you are destined to become is the person you decide to be.',
    attribution: 'Ralph Waldo Emerson',
  },
  {
    id: 'q-055',
    text: 'Go confidently in the direction of your dreams. Live the life you have imagined.',
    attribution: 'Henry David Thoreau',
  },
  {
    id: 'q-056',
    text: 'If you tell the truth, you do not have to remember anything.',
    attribution: 'Mark Twain',
  },
  {
    id: 'q-057',
    text: 'Walking with a friend in the dark is better than walking alone in the light.',
    attribution: 'Helen Keller',
  },
  {
    id: 'q-058',
    text: 'When we are no longer able to change a situation, we are challenged to change ourselves.',
    attribution: 'Viktor Frankl',
  },
  {
    id: 'q-059',
    text: 'Everything you can imagine is real.',
    attribution: 'Pablo Picasso',
  },
  {
    id: 'q-060',
    text: 'What you do speaks so loudly that I cannot hear what you say.',
    attribution: 'Ralph Waldo Emerson',
  },
];

export function randomQuote(): Quote {
  return QUOTES[Math.floor(Math.random() * QUOTES.length)];
}
