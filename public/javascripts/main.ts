
import { QuizManager, Question } from './quiz.js'

let quiz: QuizManager
let questionsArray: Question[]
function init(id: number, title: string) {

    document.getElementById('introText').innerText = 'Rozwiąż ten quiz, odpowiedz na pytania, z fartem!'
    document.getElementById('quizList').classList.add('hidden')
    document.getElementById('question-container').classList.remove('hidden')
    document.getElementById('quizTitle').innerText = title
    document.getElementById('timer-container').classList.remove('hidden')

    fetch('/quiz/' + id.toString())
        .then(res => res.json())
        .then((data) => {
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
                quiz.finish(id);
            });
        }).catch((reason) => {
            console.log(reason)
        })
}

document.querySelectorAll('.quizSelectButton').forEach(item => {
    item.addEventListener('click', (event) => {
        const arg1 = parseInt((event.target as HTMLElement).getAttribute('data-arg1'));
        const arg2: string = (event.target as HTMLElement).getAttribute('data-arg2')
        init(arg1, arg2);
    })
})