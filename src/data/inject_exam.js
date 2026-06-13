const fs = require('fs');

const pilotQuestions = JSON.parse(fs.readFileSync('e:/FPV DRONES/OpenFPV_vercel_version/OpenFPV_Pilot/src/data/pilot_json.json', 'utf8'));

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
    questions: ${JSON.stringify(pilotQuestions, null, 6)}
  },\n`;

let examsData = fs.readFileSync('e:/FPV DRONES/OpenFPV_vercel_version/OpenFPV_Pilot/src/data/exams.js', 'utf8');

examsData = examsData.replace('export const EXAM_BANKS = {', 'export const EXAM_BANKS = {\n' + pilotingExamStr);

fs.writeFileSync('e:/FPV DRONES/OpenFPV_vercel_version/OpenFPV_Pilot/src/data/exams.js', examsData);
