import { EXAM_BANKS } from './exams.js';

console.log("Keys in EXAM_BANKS:", Object.keys(EXAM_BANKS));
if (EXAM_BANKS['piloting']) {
  console.log("Piloting exam exists!");
  console.log("Title:", EXAM_BANKS['piloting'].title);
  console.log("Topics:", EXAM_BANKS['piloting'].topicsCovered.length);
  console.log("Questions:", EXAM_BANKS['piloting'].questions.length);
} else {
  console.log("Piloting exam not found in EXAM_BANKS");
}
