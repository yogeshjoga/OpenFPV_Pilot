const fs = require('fs');

const text = fs.readFileSync('e:/FPV DRONES/OpenFPV_vercel_version/OpenFPV_Pilot/src/data/raw_pilot.txt', 'utf8');

const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);

const questions = [];
let i = 0;
while (i < lines.length) {
  if (lines[i].match(/^Q\d+/)) {
    const id = lines[i].toLowerCase();
    i++;
    const questionText = lines[i];
    i++;
    const options = [];
    while (i < lines.length && lines[i].match(/^[A-D]\./)) {
      options.push(lines[i].substring(2).trim());
      i++;
    }
    let answerText = lines[i];
    let answerIdx = 0;
    if (answerText && answerText.startsWith('Answer:')) {
      const letter = answerText.split(':')[1].trim();
      answerIdx = letter.charCodeAt(0) - 65;
    }
    
    let difficulty = 'easy';
    const qNum = parseInt(id.replace('q', ''));
    if (qNum >= 16 && qNum <= 35) difficulty = 'medium';
    if (qNum >= 36 && qNum <= 50) difficulty = 'hard';
    if (qNum >= 51 && qNum <= 120) difficulty = 'hard';

    questions.push({
      id,
      difficulty,
      question: questionText,
      options,
      answer: answerIdx
    });
  }
  i++;
}

console.log(JSON.stringify(questions, null, 2));
