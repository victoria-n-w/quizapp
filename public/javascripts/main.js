import { QuizManager } from './quiz.js';
const questionsArray = [{
        "penalty": 5,
        "content": "2+2",
        "answer": '4'
    },
    {
        "penalty": 6,
        "content": "2+2*2",
        "answer": '6'
    },
    {
        "penalty": 7,
        "content": "(2+2)*2",
        "answer": '8'
    },
    {
        "penalty": 8,
        "content": "2+2*2+2",
        "answer": '8'
    },
    {
        "penalty": 9,
        "content": "2+2^2*2+2",
        "answer": '12'
    },
    {
        "penalty": 69,
        "content": "400 + 20",
        "answer": '420'
    }
];
const quiz = new QuizManager(questionsArray);
document.getElementById('start-button').addEventListener("click", () => {
    quiz.start();
});
document.getElementById('next').addEventListener("click", () => {
    quiz.next();
});
document.getElementById('prvs').addEventListener('click', () => {
    quiz.prvs();
});
document.getElementById('finish').addEventListener('click', () => {
    quiz.finish();
});
document.getElementById('save-button').addEventListener('click', () => {
    quiz.save(false);
    quiz.reset();
});
document.getElementById('cancel').addEventListener('click', () => {
    quiz.cancel();
});
document.getElementById('save-extra-button').addEventListener('click', () => {
    quiz.save(true);
    quiz.reset();
});
//# sourceMappingURL=main.js.map