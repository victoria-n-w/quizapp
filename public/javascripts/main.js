import { QuizManager } from './quiz.js';
let quiz;
let questionsArray;
function init(id, title) {
    document.getElementById('introText').innerText = 'Rozwiąż ten quiz, odpowiedz na pytania, z fartem!';
    document.getElementById('quizList').classList.add('hidden');
    document.getElementById('question-container').classList.remove('hidden');
    document.getElementById('quizTitle').innerText = title;
    document.getElementById('timer-container').classList.remove('hidden');
    fetch('/quiz/' + id.toString())
        .then(res => res.json())
        .then((data) => {
        console.log(data);
        quiz = new QuizManager(data);
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
        document.getElementById('cancel').addEventListener('click', () => {
            quiz.cancel();
        });
    }).catch((reason) => {
        console.log(reason);
    });
}
document.querySelectorAll('.quizSelectButton').forEach(item => {
    item.addEventListener('click', (event) => {
        const arg1 = parseInt(event.target.getAttribute('data-arg1'));
        const arg2 = event.target.getAttribute('data-arg2');
        init(arg1, arg2);
    });
});
//# sourceMappingURL=main.js.map