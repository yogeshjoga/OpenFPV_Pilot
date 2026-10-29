// Training for each flight mode: a ladder of tasks, easiest first. A student works down the list, ticking tasks off.
// goal = how you know you have done it. Always train in a simulator first, then outside in an open field.

export const TRAINING = {
  angle: {
    intro: 'Aim: smooth hands on all four sticks. Do not move on until each task feels boring.',
    rules: ['Fly in an open field, with nobody near, and props on only when you are ready to fly.', 'Use a simulator for the first hours: crashes cost nothing there.', 'Stop a pack the moment you get tired. Tired hands make crashes.'],
    tasks: [
      { id: 'a1', level: 'Beginner', title: 'Hover at eye height', time: '3 packs', how: 'Take off to about 1.5 metres and hold the position. Make small, gentle stick corrections. Land softly.', goal: 'Stay inside a 1 metre circle for 30 seconds.' },
      { id: 'a2', level: 'Beginner', title: 'Climb and descend', time: '2 packs', how: 'Move only the throttle: rise smoothly to 3 metres, then come down to 1 metre. Do not touch other sticks unless you drift.', goal: 'Smooth moves with no bounce, and no sideways drift.' },
      { id: 'a3', level: 'Beginner', title: 'Slides: left, right, forward, back', time: '2 packs', how: 'Tip the right stick a little in one direction, go about 3 metres, then ease it back to the centre. The drone levels and stops.', goal: 'Stop on a marker, every time, in all four directions.' },
      { id: 'a4', level: 'Beginner', title: 'Yaw a full turn on the spot', time: '2 packs', how: 'Hover. Use only the left stick to the side to spin slowly all the way round, then stop it facing the same way.', goal: 'A full turn, with the drone staying in the same place.' },
      { id: 'a5', level: 'Intermediate', title: 'Fly the box', time: '3 packs', how: 'Fly a square with 4 metre sides at 1.5 metres height. Pitch forward for the side, yaw a quarter turn at each corner.', goal: 'Hit the four corners and finish where you started, both directions.' },
      { id: 'a6', level: 'Intermediate', title: 'Nose-in hover', time: '2 packs', how: 'Hover with the drone turned to face you. Left and right on the stick are now swapped, so start slowly and low.', goal: 'Hold a 20 second hover, nose in.' },
      { id: 'a7', level: 'Intermediate', title: 'Fly the circle, then the 8', time: '4 packs', how: 'Use the 0 and 8 patterns from the Loops section. Keep the height the same all the way round.', goal: '3 clean circles each way, then 3 clean 8s.' },
      { id: 'a8', level: 'Intermediate', title: 'Precision landing', time: '2 packs', how: 'Fly a short circuit, then land the drone on a 50 cm mat, softly, with the nose pointing the way you chose.', goal: '5 landings in a row on the mat.' },
    ],
  },
  horizon: {
    intro: 'Aim: try your first flips and rolls with a safety net. This stage is short.',
    rules: ['Fly at least 5 metres high and over soft grass.', 'Practise one move at a time.', 'Move to Acro as soon as you can do each move calmly.'],
    tasks: [
      { id: 'h1', level: 'Beginner', title: 'Feel the blend', time: '1 pack', how: 'At height, move the roll stick a little (it levels), then move it to the end (it rolls). Feel where the change happens.', goal: 'You can say when the drone will level and when it will roll.' },
      { id: 'h2', level: 'Intermediate', title: 'Single roll', time: '3 packs', how: 'At 5 metres or more, roll the right stick to the end for a moment and let go. Catch the drone with the throttle.', goal: '5 rolls in a row with little height lost.' },
      { id: 'h3', level: 'Intermediate', title: 'Forward flip', time: '3 packs', how: 'Fly forward, push the pitch stick to the end, add a little throttle, let go. Level out and fly on.', goal: '5 flips in a row, ending level and still flying.' },
      { id: 'h4', level: 'Intermediate', title: 'Switch to Acro for one move', time: '2 packs', how: 'Flip the mode switch to Acro just before a move, then back to Horizon. Learn what changes.', goal: 'No surprise when the switch is thrown.' },
    ],
  },
  acro: {
    intro: 'Aim: nothing levels the drone for you. You learn to keep control by feel, with small, early corrections.',
    rules: ['Put Angle on a switch before every flight. If it goes wrong, flip it and let go of the sticks.', 'Fly with at least 5 metres of clear height and soft ground.', 'Spend most of your first hours in a simulator.'],
    tasks: [
      { id: 'r1', level: 'Beginner', title: 'Stick tracing (no drone)', time: '5 min a day', how: 'Without flying, move the sticks slowly in squares and circles, with your eyes closed, to learn the travel and the centre.', goal: 'You can find the centre of each stick without looking.' },
      { id: 'r2', level: 'Beginner', title: 'Hover in Acro', time: '3 packs', how: 'Take off in Angle, then switch to Acro at 3 metres. Make tiny corrections. If it tilts, tip the stick the other way for a moment, then centre it.', goal: 'A 10 second hover, then 30 seconds.' },
      { id: 'r3', level: 'Beginner', title: 'Level forward flight', time: '3 packs', how: 'Tip forward a little to get moving. Hold the same height with the throttle: more throttle as you tilt. Fly 20 metres and back.', goal: 'Hold height within 1 metre for a whole pass.' },
      { id: 'r4', level: 'Beginner', title: 'Stop and go', time: '3 packs', how: 'Fly forward, then pitch back and add throttle to stop. Level out and hover. Repeat.', goal: 'Stop on a marker from walking pace and then from a jog.' },
      { id: 'r5', level: 'Intermediate', title: 'Banked turns', time: '4 packs', how: 'Roll into a turn and add pitch forward, with a touch of yaw to keep the nose in line. Add throttle while you bank so you hold the height.', goal: 'Fly the box and the circle with a steady height.' },
      { id: 'r6', level: 'Intermediate', title: 'Circle 0 and figure 8', time: '5 packs', how: 'Use the Loops section. Keep the speed constant and the height the same. Try both directions.', goal: '5 clean laps each way, then 5 clean 8s.' },
      { id: 'r7', level: 'Intermediate', title: 'Dive and climb', time: '3 packs', how: 'Pitch forward and lower the throttle to dive, then pitch back and punch the throttle to climb. Feel how thrust follows the tilt.', goal: 'Lose and gain 10 metres without ever touching the ground.' },
      { id: 'r8', level: 'Advanced', title: 'Roll and flip', time: '4 packs', how: 'At height, roll the stick to the end for a moment, let go, and catch the drone level with the throttle.', goal: '5 flips and 5 rolls in a row.' },
      { id: 'r9', level: 'Advanced', title: 'Power loop and split-S', time: '5 packs', how: 'A power loop goes up and over. A split-S rolls upside down and pulls through to level. Both need height and speed management.', goal: 'Both moves, three times each, with no panic.' },
    ],
  },
  '3d': {
    intro: 'Aim: fly with reversible thrust, safely. This is an advanced skill and you should already be at ease in Acro.',
    rules: ['Set up with the props OFF. Test the motors only with the props off.', 'Always put a switch on a way back to a normal mode.', 'Never arm with the throttle away from the middle. Centre it first.', 'Fly in a large open space, far from people.'],
    tasks: [
      { id: 't1', level: 'Setup', title: 'Set up 3D mode (props off)', time: '30 min', how: 'Check that your ESCs support bidirectional motors, set 3D mode in the configurator, set the middle dead band, and check the motors stop at the centre.', goal: 'Centre means motors off. Above the middle spins one way. Below spins the other.' },
      { id: 't2', level: 'Beginner', title: 'Hover upright', time: '3 packs', how: 'Take off with the throttle a little above the middle (about 75% up). Make small corrections. Land by bringing it down to the middle.', goal: 'A 20 second hover without panic.' },
      { id: 't3', level: 'Beginner', title: 'Feel the reverse', time: '2 packs', how: 'At height, lower the throttle slowly below the middle and feel the thrust fall, then reverse. Raise it again before you lose height.', goal: 'You can say which part of the throttle does what.' },
      { id: 't4', level: 'Intermediate', title: 'Flip and hold inverted', time: '4 packs', how: 'At 5 metres or more, flip the drone upside down, then move the throttle below the middle to hold the height. Flip back when ready.', goal: 'A 5 second inverted hover, then 15 seconds.' },
      { id: 't5', level: 'Advanced', title: 'Inverted slides and circles', time: '5 packs', how: 'Inverted, tip the sticks gently to slide and fly the circle. The pitch and roll sticks still do what they say.', goal: 'A full inverted circle without losing 2 metres.' },
      { id: 't6', level: 'Advanced', title: 'Roll through to the other side', time: '4 packs', how: 'Roll from upright to inverted while moving the throttle from above the middle to below it in time with the flip.', goal: 'A roll with almost no change in height.' },
    ],
  },
}
