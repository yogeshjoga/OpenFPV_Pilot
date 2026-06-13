const fs = require('fs');

try {
  const text = fs.readFileSync('e:/FPV DRONES/OpenFPV_vercel_version/OpenFPV_Pilot/src/data/raw_build.txt', 'utf8');
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
    "Soldering Science", "Flux Usage", "Heat Transfer", "Wire Management", "XT60 Connections", "ESC-FC Wiring", "Motor Wiring", "VTX-Camera Wiring", "Capacitor Installation", "Frame Selection", "Power System Design", "Build Reliability", "Troubleshooting", "Professional Assembly Practices", "Safety Procedures", "Pre-Flight Verification"
  ];

  const buildExamStr = `  build: {
    id: 'build',
    title: 'FPV Drone Building & Assembly Certification Exam',
    topicsCovered: ${JSON.stringify(topicsCovered)},
    questions: ${JSON.stringify(questions, null, 6)}
  }`;

  let examsData = fs.readFileSync('e:/FPV DRONES/OpenFPV_vercel_version/OpenFPV_Pilot/src/data/exams.js', 'utf8');

  // Replace the old build placeholder
  const placeholderRegex = /build:\s*\{\s*id:\s*'build',\s*title:\s*'Building Certification Exam',\s*questions:\s*\[\][^\}]*\}/g;
  
  if (examsData.match(placeholderRegex)) {
    examsData = examsData.replace(placeholderRegex, buildExamStr);
    fs.writeFileSync('e:/FPV DRONES/OpenFPV_vercel_version/OpenFPV_Pilot/src/data/exams.js', examsData);
    console.log("Successfully wrote to exams.js by replacing placeholder");
  } else {
    // If not found, inject it at the top just in case
    console.log("Could not find build placeholder. Injecting at the top.");
    examsData = examsData.replace('export const EXAM_BANKS = {', 'export const EXAM_BANKS = {\n' + buildExamStr + ',\n');
    fs.writeFileSync('e:/FPV DRONES/OpenFPV_vercel_version/OpenFPV_Pilot/src/data/exams.js', examsData);
  }

} catch (err) {
  console.error("ERROR", err);
}
