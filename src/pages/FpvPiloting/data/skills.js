// The skills around the sticks: muscle memory, focus, and flying fast. Plain advice, short and practical.

export const MUSCLE = {
  intro: 'Muscle memory is the hands doing the right thing before you have time to think. It is built by many short, careful, repeated practices, not by long tiring ones.',
  principles: [
    { title: 'Short and often', text: 'Fifteen focused minutes every day beats two hours at the weekend. The brain files what you learned while you sleep.' },
    { title: 'Slow is smooth, smooth is fast', text: 'Fly each pattern slowly and cleanly first. Speed comes by itself once the hands know the move.' },
    { title: 'One thing at a time', text: 'Pick one skill for a session, such as the 8 or the corner of the 7. Repeat it until it is dull, then change.' },
    { title: 'Same move, many times', text: 'Do the move 20 times in a row. The first few are for learning, the last few are for owning it.' },
  ],
  exercises: [
    { title: 'Stick tracing', time: '5 min, daily', text: 'Props off, drone off. Slowly draw squares, circles and 8s with each stick, then with both together. Look at your fingers first, then with your eyes closed.', for: 'Finding the stick centre and travel.' },
    { title: 'Simulator laps', time: '15 min, daily', text: 'Use a drone simulator. Fly one pattern (the circle, the 8, the 7) until it is clean. Crashes cost nothing, so push it.', for: 'The most hours at the lowest cost.' },
    { title: 'Call it out loud', time: 'every flight', text: 'Say what you are about to do: "bank left, throttle up, roll out". The words link the thought to the move.', for: 'Making your plan and your hands agree.' },
    { title: 'Hover drill', time: '2 min, every pack', text: 'Start every pack with a two-minute hover in the mode you are training. It warms up your hands and shows you how you are today.', for: 'Fine control of all four sticks.' },
    { title: 'Mirror drill', time: '10 min', text: 'Fly a pattern to the left, then exactly the same to the right. Most pilots have a weaker side. Practise it until the two sides match.', for: 'Even skill on both sides.' },
    { title: 'Film and review', time: '5 min', text: 'Record the flight or the simulator screen. Watch it back and find one thing to fix. Note it and fix only that next time.', for: 'Seeing mistakes you cannot feel.' },
  ],
  plan: [
    { week: 'Week 1', focus: 'Stick tracing and hover', work: 'Daily stick tracing. Simulator hovers in Angle. One real hover pack.' },
    { week: 'Week 2', focus: 'Slides, the box and the circle', work: 'Simulator box and 0 in both directions. Two real packs a week.' },
    { week: 'Week 3', focus: 'The 8 and the 7', work: 'Simulator 8s and 7s, then the real field. Start working in Acro in the simulator.' },
    { week: 'Week 4', focus: 'Mix it up and go faster', work: 'Chain the patterns: 0, 8, 7 in one flight. Raise your speed a little each day.' },
  ],
}

export const FOCUS = {
  intro: 'Fast flying is decided in the head. A calm, clear mind makes small, early corrections, and a rushed one makes big, late ones.',
  routine: [
    { title: 'Before the pack', items: ['Check the drone, the props and the battery. A worry about the drone steals attention.', 'Walk the field: where are the people, the trees and the wires?', 'Pick ONE thing to practise on this pack.'] },
    { title: 'In the air', items: ['Look at where you are going, not at the drone: eyes up and ahead.', 'Breathe out slowly and keep your shoulders loose. Tight shoulders make tight hands.', 'Relax your thumbs. A light grip gives fine control.'] },
    { title: 'After the pack', items: ['Say one thing that went well and one thing to fix.', 'Rest for a few minutes. Drink some water.', 'Stop when you are tired. Most crashes come in the last pack.'] },
  ],
  habits: [
    { title: 'Remove distractions', text: 'Phone away. Music off. Fly with one goal and give it all your attention.' },
    { title: 'Keep sessions short', text: 'Attention fades after 15 to 20 minutes of hard focus. Take a break between packs.' },
    { title: 'Look ahead, always', text: 'Your eyes should be two or three seconds ahead of the drone, deciding the next move while your hands do this one.' },
    { title: 'One mistake, then move on', text: 'After a bad turn, do not stew on it: it steals the focus you need for the next one.' },
    { title: 'Sleep and food', text: 'Tired and hungry pilots crash. Eat, drink and sleep: it is part of the training.' },
  ],
}

// the 100+ km/h section
export const FAST = {
  intro: 'At 100 km/h a drone covers nearly 28 metres every second. It is not about faster hands: it is about seeing earlier, deciding earlier and keeping a way out.',
  decisions: {
    title: 'How to decide at 100+ km/h',
    steps: [
      { n: '1', title: 'Look far ahead', text: 'Look at least 3 seconds ahead, which is about 80 metres at 100 km/h. What you look at is where the drone goes. Looking at the gate you just passed is already too late.' },
      { n: '2', title: 'Have a plan for the next two obstacles', text: 'Know your line through the next gate and the one after. When you pass the first, the plan for the second is already made.' },
      { n: '3', title: 'Decide early and commit', text: 'A decision made early is a small stick move. A decision made late is a big one. Choose, then fly the line with no second thoughts.' },
      { n: '4', title: 'Keep an exit', text: 'Always know where you will go if it goes wrong: up is the safest. A line with no exit is a line you do not fly at speed.' },
      { n: '5', title: 'If in doubt, slow down', text: 'There is no shame in lifting off the speed. Add speed again once you know the line.' },
    ],
  },
  braking: {
    title: 'How to brake',
    intro: 'A drone brakes by tipping its nose up so the thrust pushes backwards. Good braking is early, firm and smooth.',
    items: [
      { title: 'Pitch back and add throttle', text: 'Ease the pitch stick back to tilt the nose up. The thrust now pushes against your movement. Add throttle as you tilt, because less of the thrust is holding you up.' },
      { title: 'Brake early, not late', text: 'Start slowing before the corner. Late and violent braking makes the drone pitch up too far, bounce, or lose its line.' },
      { title: 'Trade speed for height', text: 'Pull up and climb: the speed turns into height and you slow down on the way up. A "zoom" climb is a good way to bleed speed in open space.' },
      { title: 'Use the turn', text: 'A tight banked turn also scrubs speed, because the drone points sideways to its movement. Use it when you have to turn as well as stop.' },
      { title: 'Level out gently', text: 'When the speed is gone, return the nose to level smoothly. A sharp return makes the drone surge forward again.' },
    ],
  },
  speedControl: {
    title: 'How to control your speed',
    items: [
      { title: 'Pitch stick is your speed stick', text: 'The further the nose tips down, the faster you go. Learn what half stick gives, then three-quarters, then full.' },
      { title: 'Build speed in steps', text: 'Fly the same line at 40, 60, 80, then 100 km/h. Only go faster once the last speed is clean.' },
      { title: 'Know your drone\'s speed', text: 'Look at the telemetry or the speed on the OSD. Know what a comfortable speed feels like for each place you fly.' },
      { title: 'Wind changes everything', text: 'Flying into a headwind is slower on the ground than in the air; with a tailwind it is faster and brakes take far longer. Allow for it.' },
      { title: 'Rates and expo help', text: 'A gentler stick curve around the centre makes small corrections easier at speed. Set it with the Rates section in your flight software.' },
    ],
  },
  quick: {
    title: 'How to make fast decisions',
    items: [
      { title: 'Practise reading the course', text: 'Fly a track slowly and say out loud the next two gates. Do it until you can name them without thinking.' },
      { title: 'Pre-decide your choices', text: 'Make rules in advance: "if the gate is too tight, go over it". A rule you made on the ground is a decision you do not have to make in the air.' },
      { title: 'Cut the options', text: 'Pick one main line and one backup, and nothing else. Fewer options means a faster choice.' },
      { title: 'Learn from the flight, not during it', text: 'If something goes wrong, keep flying and fix it afterwards. Fighting a mistake in the air causes the next one.' },
      { title: 'Train reaction', text: 'In a simulator, fly a random course and a random gate order. It teaches you to read and react, not to memorise a line.' },
    ],
  },
  safety: 'Fly fast only in a large, open, legal area with no people near. Ask local rules about where you may fly and the speed and height limits. Wear goggles with a spotter beside you.',
}
