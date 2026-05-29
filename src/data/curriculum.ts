/*
 * Curriculum — spec §6. Nine units, progressive from home-row repetition up to
 * full-paragraph fluency. Each lesson has 3–5 drills, ~80–200 chars each.
 *
 * Lesson authoring rules from §6:
 *  - Never introduce a key the user hasn't met.
 *  - Drill 1 of each lesson is pure repetition.
 *  - Drill 2 mixes new with previously learned.
 *  - Drill 3+ uses real words once enough keys are unlocked.
 *  - No nonsense after unit 5 — only real English words/sentences.
 */
import type { Lesson } from '../types';

export const CURRICULUM: Lesson[] = [
  // ---------- UNIT 1: HOME ROW ----------
  {
    id: '01-home-fj',
    unit: 1,
    order: 1,
    title: 'Home row: F & J',
    description: 'Your index fingers rest on F and J. The little bumps guide you.',
    introducesKeys: ['f', 'j'],
    drills: [
      'fff jjj fff jjj fff jjj fff jjj fff jjj fff jjj fff jjj fff jjj',
      'fj fj jf jf fj fj jf jf fjj fjj jff jff fjf jfj fjf jfj fff jjj',
      'jj ff jj ff jjj fff jjj fff jfj fjf jfj fjf ff jj ff jj jjj fff',
    ],
    prerequisites: [],
  },
  {
    id: '02-home-dk',
    unit: 1,
    order: 2,
    title: 'Home row: D & K',
    description: 'Middle fingers reach for D and K. Stay anchored on F and J.',
    introducesKeys: ['d', 'k'],
    drills: [
      'ddd kkk ddd kkk ddd kkk ddd kkk ddd kkk ddd kkk ddd kkk ddd kkk',
      'dk dk kd kd dk dk kd kd dkk dkk kdd kdd dkd kdk dkd kdk ddd kkk',
      'fjdk fjdk fjdk fjdk djfk djfk kfdj kfdj fdjk fdjk kjfd kjfd',
    ],
    prerequisites: ['01-home-fj'],
  },
  {
    id: '03-home-sl',
    unit: 1,
    order: 3,
    title: 'Home row: S & L',
    description: 'Ring fingers add S and L. Three keys per hand now.',
    introducesKeys: ['s', 'l'],
    drills: [
      'sss lll sss lll sss lll sss lll sss lll sss lll sss lll sss lll',
      'sl sl ls ls sl sl ls ls sll sll lss lss sls lsl sls lsl sss lll',
      'sdf jkl sdf jkl sfd ljk dsf klj fls jds fls jds sdf jkl sdf jkl',
    ],
    prerequisites: ['02-home-dk'],
  },
  {
    id: '04-home-asemi',
    unit: 1,
    order: 4,
    title: 'Home row: A & ;',
    description: 'Pinkies meet A and semicolon. Full home row, both hands.',
    introducesKeys: ['a', ';'],
    drills: [
      'aaa ;;; aaa ;;; aaa ;;; aaa ;;; aaa ;;; aaa ;;; aaa ;;; aaa ;;;',
      'a; a; ;a ;a a;; a;; ;aa ;aa a;a ;a; a;a ;a; aaa ;;; aaa ;;; ',
      'asdf jkl; asdf jkl; asdf jkl; asdf jkl; asdf jkl; asdf jkl;',
    ],
    prerequisites: ['03-home-sl'],
  },

  // ---------- UNIT 2: HOME ROW WORDS ----------
  {
    id: '05-home-words',
    unit: 2,
    order: 1,
    title: 'Words from the home row',
    description: 'Real letter combos using only home-row keys.',
    introducesKeys: [],
    drills: [
      'ask ask add add fad fad dad dad sad sad lad lad lad add ask sad',
      'all all all alls alls fall fall fall flask flask flask glass glass',
      'asks alas dads lads salad falls flask flask alfalfa salads dads',
    ],
    prerequisites: ['04-home-asemi'],
  },
  {
    id: '06-home-sentences',
    unit: 2,
    order: 2,
    title: 'Mini sentences (home row)',
    description: 'Tiny phrases. Aim for accuracy, not speed.',
    introducesKeys: [],
    drills: [
      'a sad lad asks a salad. a dad falls. all lads ask.',
      'all alfalfa falls. dads ask sad lads. salads add dads.',
      'a flask falls. dads add salads. lads ask a sad dad. all is calm.',
    ],
    prerequisites: ['05-home-words'],
  },

  // ---------- UNIT 3: TOP ROW ----------
  {
    id: '07-top-ei',
    unit: 3,
    order: 1,
    title: 'Top row: E & I',
    description: 'Middle fingers reach up to E and I.',
    introducesKeys: ['e', 'i'],
    drills: [
      'eee iii eee iii eee iii eee iii eee iii eee iii eee iii eee iii',
      'ed ed ik ik de de ki ki ed di id ik de ki ed ki id di',
      'side side aide aide lied lied ifs ifs des des sid sid',
    ],
    prerequisites: ['06-home-sentences'],
  },
  {
    id: '08-top-ru',
    unit: 3,
    order: 2,
    title: 'Top row: R & U',
    description: 'Index fingers stretch to R and U.',
    introducesKeys: ['r', 'u'],
    drills: [
      'rrr uuu rrr uuu rrr uuu rrr uuu rrr uuu rrr uuu rrr uuu rrr uuu',
      'fr fr ju ju ur ur ru ru fru fru juf juf urd urd dru dru',
      'rude rude users users issue issue ruled ruled reads reads suds',
    ],
    prerequisites: ['07-top-ei'],
  },
  {
    id: '09-top-ty',
    unit: 3,
    order: 3,
    title: 'Top row: T & Y',
    description: 'Index fingers stretch to T and Y.',
    introducesKeys: ['t', 'y'],
    drills: [
      'ttt yyy ttt yyy ttt yyy ttt yyy ttt yyy ttt yyy ttt yyy ttt yyy',
      'ft jy ft jy ty ty yt yt fty jyt yt ty ty yt yt',
      'easy easy stays stays styles styles ladies ladies daily daily',
    ],
    prerequisites: ['08-top-ru'],
  },
  {
    id: '10-top-wo',
    unit: 3,
    order: 4,
    title: 'Top row: W & O',
    description: 'Ring fingers reach to W and O.',
    introducesKeys: ['w', 'o'],
    drills: [
      'www ooo www ooo www ooo www ooo www ooo www ooo www ooo www ooo',
      'sw lo sw lo wo wo ow ow swo low ows wos wo ow',
      'wood wood words words world world write write fellow fellow rows',
    ],
    prerequisites: ['09-top-ty'],
  },
  {
    id: '11-top-qp',
    unit: 3,
    order: 5,
    title: 'Top row: Q & P',
    description: 'Pinkies hit Q and P. Full top row unlocked.',
    introducesKeys: ['q', 'p'],
    drills: [
      'qqq ppp qqq ppp qqq ppp qqq ppp qqq ppp qqq ppp qqq ppp qqq ppp',
      'aq ;p aq ;p qp qp pq pq quay quay pop pop opt opt past past',
      'quite quiet aptly proud quirky purpose typist quiet quite people',
    ],
    prerequisites: ['10-top-wo'],
  },

  // ---------- UNIT 4: BOTTOM ROW ----------
  {
    id: '12-bot-vm',
    unit: 4,
    order: 1,
    title: 'Bottom row: V & M',
    description: 'Index fingers drop to V and M.',
    introducesKeys: ['v', 'm'],
    drills: [
      'vvv mmm vvv mmm vvv mmm vvv mmm vvv mmm vvv mmm vvv mmm vvv mmm',
      'fv jm fv jm vm vm mv mv vam jum vam jum dive dive moves moves',
      'mover mover voiced voiced volumes volumes massive massive vivid',
    ],
    prerequisites: ['11-top-qp'],
  },
  {
    id: '13-bot-c-comma',
    unit: 4,
    order: 2,
    title: 'Bottom row: C & ,',
    description: 'Middle fingers reach to C and comma.',
    introducesKeys: ['c', ','],
    drills: [
      'ccc ,,, ccc ,,, ccc ,,, ccc ,,, ccc ,,, ccc ,,, ccc ,,, ccc ,,,',
      'dc k, dc k, c, c, ,c ,c code code, copy copy, calm calm,',
      'cars, cards, cycles, voices, comments, comics, cousins, classics,',
    ],
    prerequisites: ['12-bot-vm'],
  },
  {
    id: '14-bot-x-period',
    unit: 4,
    order: 3,
    title: 'Bottom row: X & .',
    description: 'Ring fingers reach to X and period.',
    introducesKeys: ['x', '.'],
    drills: [
      'xxx ... xxx ... xxx ... xxx ... xxx ... xxx ... xxx ... xxx ...',
      'sx l. sx l. x. x. .x .x mix. mix. fox. fox. taxi. taxi. lax. lax.',
      'a fox jumps. mix it up. extra credit. exited the taxi. exact.',
    ],
    prerequisites: ['13-bot-c-comma'],
  },
  {
    id: '15-bot-z-slash',
    unit: 4,
    order: 4,
    title: 'Bottom row: Z & /',
    description: 'Pinkies reach to Z and slash.',
    introducesKeys: ['z', '/'],
    drills: [
      'zzz /// zzz /// zzz /// zzz /// zzz /// zzz /// zzz /// zzz ///',
      'az ;/ az ;/ z/ z/ /z /z zip zip jazz jazz puzzle puzzle quiz quiz',
      'lazy zebra zooms. amaze me. quartz/jazz. dizzy quizzes. zoom/zoom.',
    ],
    prerequisites: ['14-bot-x-period'],
  },
  {
    id: '16-bot-bn',
    unit: 4,
    order: 5,
    title: 'Bottom row: B & N',
    description: 'Index fingers stretch to B and N. Whole keyboard now.',
    introducesKeys: ['b', 'n'],
    drills: [
      'bbb nnn bbb nnn bbb nnn bbb nnn bbb nnn bbb nnn bbb nnn bbb nnn',
      'fb jn fb jn bn bn nb nb bun bun nab nab band band number number',
      'banner, neighbors, bonus, bandanna, beneath, bonny, blunt, bins.',
    ],
    prerequisites: ['15-bot-z-slash'],
  },

  // ---------- UNIT 5: COMMON WORDS ----------
  {
    id: '17-common-the-and',
    unit: 5,
    order: 1,
    title: 'High-frequency: the, and, of, to',
    description: 'The four most common English words. Type them until they feel automatic.',
    introducesKeys: [],
    drills: [
      'the the the and and and of of of to to to the and the and of to',
      'the cat and the dog. the way to the door. the end of the road.',
      'to the moon and back, the answer is to ask. the of and to the.',
    ],
    prerequisites: ['16-bot-bn'],
  },
  {
    id: '18-common-ing-ion',
    unit: 5,
    order: 2,
    title: 'Endings: ing, ion, tion',
    description: 'English suffixes you will type thousands of times.',
    introducesKeys: [],
    drills: [
      'ing ing ion ion tion tion ing ion tion making sing king ring',
      'doing typing running winning gaining the action and the motion',
      'station, action, motion, lotion, fraction, doing the typing thing',
    ],
    prerequisites: ['17-common-the-and'],
  },
  {
    id: '19-common-pronouns',
    unit: 5,
    order: 3,
    title: 'Pronouns and connectors',
    description: 'I, you, he, she, it, we, they, that, this.',
    introducesKeys: [],
    drills: [
      'i you he she it we they that this i you he she it we they that',
      'this is a test that we like and they like it and we know that.',
      'she said it was easy and they thought he would type like a pro.',
    ],
    prerequisites: ['18-common-ing-ion'],
  },
  {
    id: '20-common-short-sentences',
    unit: 5,
    order: 4,
    title: 'Short, real sentences',
    description: 'Tiny stories. Stay relaxed, watch your accuracy.',
    introducesKeys: [],
    drills: [
      'she walks the dog. they read the book. we eat the bread together.',
      'the river runs deep and the trees grow tall on the quiet hillside.',
      'a small bird sings in the morning. the children laugh and play.',
    ],
    prerequisites: ['19-common-pronouns'],
  },

  // ---------- UNIT 6: CAPITALIZATION ----------
  {
    id: '21-cap-left-shift',
    unit: 6,
    order: 1,
    title: 'Left shift (right-hand capitals)',
    description: 'Press the LEFT shift to capitalize letters typed by the right hand.',
    introducesKeys: ['Shift'],
    drills: [
      'Jj Kk Ll Hh Yy Uu Ii Oo Pp Nn Mm Jj Kk Ll Hh Uu Ii Oo Pp Nn Mm',
      'Hello Hello June June Knee Knee Look Look Most Most Nice Nice',
      'Hello there. Jump high. Keep moving. Look up. Make it count today.',
    ],
    prerequisites: ['20-common-short-sentences'],
  },
  {
    id: '22-cap-right-shift',
    unit: 6,
    order: 2,
    title: 'Right shift (left-hand capitals)',
    description: 'Press the RIGHT shift to capitalize letters typed by the left hand.',
    introducesKeys: [],
    drills: [
      'Aa Ss Dd Ff Gg Qq Ww Ee Rr Tt Vv Cc Xx Zz Bb Aa Ss Dd Ff Gg Qq',
      'Adam Adam Cats Cats Dogs Dogs Read Read Quiet Quiet Boats Boats',
      'Across the river, Big trees grow. Quiet Days, Calm Skies, Soft Wind.',
    ],
    prerequisites: ['21-cap-left-shift'],
  },
  {
    id: '23-cap-mixed',
    unit: 6,
    order: 3,
    title: 'Mixed capitalization',
    description: 'Both shifts in a single passage. Use the opposite hand to shift.',
    introducesKeys: [],
    drills: [
      'New York is large. London is older. Paris is romantic. Tokyo glows.',
      'On Monday I wrote a note for Sarah. By Friday she had read it twice.',
      'The Great Lakes are in North America. Mount Fuji is in Japan.',
    ],
    prerequisites: ['22-cap-right-shift'],
  },

  // ---------- UNIT 7: NUMBERS ----------
  {
    id: '24-num-1-5',
    unit: 7,
    order: 1,
    title: 'Numbers 1 through 5',
    description: 'Left-hand number row. Keep wrists relaxed.',
    introducesKeys: ['1', '2', '3', '4', '5'],
    drills: [
      '111 222 333 444 555 111 222 333 444 555 111 222 333 444 555',
      '1 2 3 4 5 12 23 34 45 51 15 24 35 41 52 13 24 35 41 52 13',
      '12 trees, 23 birds, 34 cats, 45 dogs, 51 stars, 13 sails, 25 lights',
    ],
    prerequisites: ['23-cap-mixed'],
  },
  {
    id: '25-num-6-0',
    unit: 7,
    order: 2,
    title: 'Numbers 6 through 0',
    description: 'Right-hand number row.',
    introducesKeys: ['6', '7', '8', '9', '0'],
    drills: [
      '666 777 888 999 000 666 777 888 999 000 666 777 888 999 000',
      '6 7 8 9 0 67 78 89 90 06 60 79 80 96 70 86 97 80 79 68 70',
      '67 chairs, 78 desks, 89 tables, 90 lamps, 100 rugs, 60 cups, 70 hats',
    ],
    prerequisites: ['24-num-1-5'],
  },
  {
    id: '26-num-mixed',
    unit: 7,
    order: 3,
    title: 'Mixed numbers',
    description: 'Bouncing across the full number row.',
    introducesKeys: [],
    drills: [
      '1 9 2 8 3 7 4 6 5 0 19 28 37 46 50 91 82 73 64 50 17 28 39 40',
      'the year 1984 came after 1983 and before 1985. 2024 follows 2023.',
      '7 days, 24 hours, 60 minutes, 365 days, 12 months, 1000 grams.',
    ],
    prerequisites: ['25-num-6-0'],
  },
  {
    id: '27-num-money',
    unit: 7,
    order: 4,
    title: 'Money and dates',
    description: 'Numbers in real-world contexts.',
    introducesKeys: [],
    drills: [
      'the bill was 12.50 and the tip was 2.00 so the total was 14.50',
      'on 03/14 we ran 5 miles in 42 minutes. on 04/01 we ran 7 in 55.',
      '1500 dollars by the end of 2026 means 125 dollars every month.',
    ],
    prerequisites: ['26-num-mixed'],
  },

  // ---------- UNIT 8: PUNCTUATION ----------
  {
    id: '28-punct-basic',
    unit: 8,
    order: 1,
    title: 'Basic punctuation',
    description: 'Periods, commas, question marks, apostrophes.',
    introducesKeys: ['?', "'"],
    drills: [
      "what's that? it's mine. don't go. yes, please. no, thanks.",
      "she said, 'hello.' he replied, 'hi, how's the day?' she smiled.",
      "are you sure? yes, i am. don't worry, it's all going to be fine.",
    ],
    prerequisites: ['27-num-money'],
  },
  {
    id: '29-punct-advanced',
    unit: 8,
    order: 2,
    title: 'Advanced punctuation',
    description: 'Colons, semicolons, quotation marks, parentheses.',
    introducesKeys: [':', '(', ')', '"'],
    drills: [
      'remember this: practice (slowly) before going fast. "accuracy first."',
      '"why?" she asked. "because," he said, "speed comes from accuracy."',
      'three things: (1) sit straight; (2) breathe; (3) keep your hands home.',
    ],
    prerequisites: ['28-punct-basic'],
  },
  {
    id: '30-punct-symbols',
    unit: 8,
    order: 3,
    title: 'Symbols you actually use',
    description: 'Dashes, ampersands, slashes, and so on.',
    introducesKeys: ['-', '&', '/', '_'],
    drills: [
      'one - two - three, A & B, true/false, max_speed, full-time work',
      'check the file: src/data/curriculum.ts — it lists all the lessons.',
      'send & receive, true_or_false, end-of-line. push/pull, stop & go.',
    ],
    prerequisites: ['29-punct-advanced'],
  },

  // ---------- UNIT 9: FLUENCY ----------
  {
    id: '31-flu-sentences',
    unit: 9,
    order: 1,
    title: 'Full sentences',
    description: 'Real prose. Aim for smooth rhythm.',
    introducesKeys: [],
    drills: [
      'The first step is the hardest, but it is the one that matters most.',
      'A small habit, repeated every day, will outpace a big habit done rarely.',
      'When you are tired, slow down. Accuracy will return faster than speed.',
    ],
    prerequisites: ['30-punct-symbols'],
  },
  {
    id: '32-flu-paragraphs',
    unit: 9,
    order: 2,
    title: 'Paragraphs',
    description: 'Longer passages. Keep your hands at home.',
    introducesKeys: [],
    drills: [
      'Typing is a motor skill, and motor skills are built by repetition. The brain learns patterns by repeating them under low stress.',
      'The single best trick for learning to touch type is to cover your hands. A light cloth over the keyboard removes the temptation to glance down.',
      'Most people give up because they push for speed too soon. The ones who stick with the slow, accurate approach reach the higher speeds within months.',
    ],
    prerequisites: ['31-flu-sentences'],
  },
  {
    id: '33-flu-mixed',
    unit: 9,
    order: 3,
    title: 'Mixed real text',
    description: 'Numbers, punctuation, capitalization, all together.',
    introducesKeys: [],
    drills: [
      'On March 14, 2026, the team shipped 1,200 changes — and only 3 broke production.',
      '"Don\'t worry," she said, "the test is at 4:30. We have time to review the 15 questions."',
      'The recipe calls for 250g flour, 100g butter, 2 eggs, and a pinch of salt. Bake at 180°C for 25 minutes.',
    ],
    prerequisites: ['32-flu-paragraphs'],
  },
];

export function findLesson(id: string): Lesson | undefined {
  return CURRICULUM.find((l) => l.id === id);
}
