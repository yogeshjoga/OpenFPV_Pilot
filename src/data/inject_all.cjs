const fs = require('fs');

try {
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
      if (qNum >= 36) difficulty = 'hard';

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

  console.log("Parsed questions:", questions.length);

  const topicsCovered = [
    "Hovering", "Altitude Control", "Throttle Management", "Smooth Turns", "Banking", 
    "Coordinated Turns", "Figure-8 Patterns", "Cinematic Flying", "Racing Techniques", 
    "Freestyle Techniques", "Target Tracking", "Gap Flying", "Emergency Recovery", 
    "Precision Landing", "Speed Control", "Drift Control", "Prop Wash Handling", 
    "Wind Compensation", "Long Range Flying", "Interceptor Drone Skills", "Professional Camera Movement"
  ];

  const pilotingExamStr = `  piloting: {
    id: 'piloting',
    title: 'FPV Professional Pilot Certification Exam',
    topicsCovered: ${JSON.stringify(topicsCovered)},
    questions: ${JSON.stringify(questions, null, 6)}
  },\n`;

  let examsData = fs.readFileSync('e:/FPV DRONES/OpenFPV_vercel_version/OpenFPV_Pilot/src/data/exams.js', 'utf8');

  if (examsData.includes('export const EXAM_BANKS = {')) {
    examsData = examsData.replace('export const EXAM_BANKS = {', 'export const EXAM_BANKS = {\n' + pilotingExamStr);
    fs.writeFileSync('e:/FPV DRONES/OpenFPV_vercel_version/OpenFPV_Pilot/src/data/exams.js', examsData);
    console.log("Successfully wrote to exams.js");
  } else {
    console.log("Could not find EXAM_BANKS export");
  }

} catch (err) {
  console.error("ERROR", err);
}
