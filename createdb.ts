const sqlite3 = require('sqlite3')
import { promisify } from 'util'


const sqlite = sqlite3.verbose()
const run = (db: typeof sqlite3.Database) => promisify(db.run.bind(db))

function createTables(): Promise<void> {
    return new Promise((resolve, reject) => {
        let db = new sqlite.Database('base.db')
        db.run(`
            CREATE TABLE users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username VARCHAR NOT NULL,
                password VARCHAR NOT NULL,
                session_control INTEGER NOT NULL
            )        
        `)

        db.run(`
            CREATE TABLE quizzes (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name VARCHAR NOT NULL
            )
        `)

        db.run(`
            CREATE TABLE questions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                content VARCHAR NOT NULL,
                answer INTEGER NOT NULL,
                penalty INTEGER NOT NULL,
                quiz_id INTEGER,
                FOREIGN KEY(quiz_id) REFERENCES quizzes(id)
            )
        `)

        db.run(`
            CREATE TABLE answers (
                answer INTEGER NOT NULL,
                time FLOAT(3) NOT NULL,
                time_percent FLOAT(9) NOT NULL,
                correct BIT,
                user_id INTEGER,
                question_id INTEGER,
                quiz_id INTEGER,
                FOREIGN KEY(user_id) REFERENCES users(id),
                FOREIGN KEY(quiz_id) REFERENCES quizzes(id),
                FOREIGN KEY(question_id) REFERENCES questions(id),
                UNIQUE(user_id, question_id)
            )
        `)

        db.run(`
            CREATE TABLE scores (
                score FLOAT(3) NOT NULL,
                user_id INTEGER,
                quiz_id INTEGER,
                FOREIGN KEY(user_id) REFERENCES users(id),
                FOREIGN KEY(quiz_id) REFERENCES quizzes(id),
                UNIQUE (user_id, quiz_id)
            )
        `)

        db.close((err: Error) => {
            if (err)
                reject(err)
            resolve()
        })
    })

}

function createUsers(): void {
    let db = new sqlite.Database('base.db')
    db.run(`
        INSERT INTO users (username, password, session_control)
        VALUES ('user1', 'user1', 0)
    `)

    db.run(`
        INSERT INTO users (username, password, session_control)
        VALUES ('user2', 'user2', 0)
    `)
}

const questionsContent = [
    '2 + 2',
    '3 * 2',
    '16 ^ 0',
    'sqrt(169)',
    '420 + 69',

    '2 * 2 + 2',
    '2 * 2 + 2 * 2',
    '2 * 2 ^ 2',
    '(2 + 2) * 2',
    '2 ^ 2 * 2 + 2',

    '5 - 7',
    '(-8) ^ 2',
    '13 - (- 3)',
    '7 * (- 7)',
    '(-3) * (-3) * (-3)',
    '6 + (- 4)',

    '100 * 100',
    '1000 * 10^(-3)',
    '10^6 - 10^5',
    '1000000 / 10^3'



]

const questionsAnswer = [
    4,
    6,
    1,
    13,
    489,

    6,
    8,
    8,
    8,
    10,

    -2,
    64,
    16,
    -49,
    -27,
    2,

    10000,
    1,
    900000,
    1000,
]

const questionQuizId = [
    0, 0, 0, 0, 0,
    1, 1, 1, 1, 1,
    2, 2, 2, 2, 2, 2,
    3, 3, 3, 3
]

async function createQuizzes() {
    let db = new sqlite.Database('base.db')

    await run(db)(`INSERT INTO quizzes (name) VALUES ('One Quiz To Rule Them All')`)
    await run(db)(`INSERT INTO quizzes (name) VALUES ('There are Two Of Them!')`)
    await run(db)(`INSERT INTO quizzes (name) VALUES ('Y so negative?')`)
    await run(db)(`INSERT INTO quizzes (name) VALUES ('Lots of Zeroes')`)


    for (let i = 0; i < questionsAnswer.length; i++) {
        const questionPenalty = Math.ceil(Math.random() * 10) + 4
        db.run(`
            INSERT INTO questions
            (quiz_id, content, answer, penalty)
            VALUES (?, ?, ?, ?)
        `, [questionQuizId[i] + 1, questionsContent[i], questionsAnswer[i], questionPenalty])
    }


}


createTables().then(() => {
    createUsers()
    createQuizzes()
}).catch(
    (reason) => {
        throw (reason)
    }
)