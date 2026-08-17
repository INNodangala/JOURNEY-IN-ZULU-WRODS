const App = {
    currentScreen: 'home',
    currentLevel: null,
    currentSubLevel: null,
    exercises: [],
    currentExerciseIndex: 0,
    selectedAnswer: null,
    exerciseResults: [],

    init() {
        AudioEngine.init();
        ProgressTracker.init();
        this.bindEvents();
        this.updateHomeScreen();
        this.showScreen('home');
    },

    bindEvents() {
        document.querySelectorAll('.level-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const level = btn.dataset.level;
                const unlockNum = parseInt(btn.dataset.unlock);
                if (ProgressTracker.isLevelUnlocked(unlockNum)) {
                    this.startLevel(level);
                } else {
                    this.showLockedMessage();
                }
            });
        });

        document.getElementById('back-btn').addEventListener('click', () => {
            this.showScreen('home');
            this.updateHomeScreen();
        });

        document.getElementById('sublevel-back-btn').addEventListener('click', () => {
            this.showScreen('home');
            this.updateHomeScreen();
        });

        document.getElementById('prev-exercise').addEventListener('click', () => {
            if (this.currentExerciseIndex > 0) {
                this.currentExerciseIndex--;
                this.renderExercise();
                this.updateNavButtons();
            }
        });

        document.getElementById('next-exercise').addEventListener('click', () => {
            if (this.currentExerciseIndex < this.exercises.length - 1) {
                this.currentExerciseIndex++;
                this.renderExercise();
                this.updateNavButtons();
            } else {
                this.finishLevel();
            }
        });
    },

    showScreen(screen) {
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
        document.getElementById(`${screen}-screen`).classList.add('active');
        this.currentScreen = screen;
    },

    updateHomeScreen() {
        document.getElementById('total-stars').textContent = ProgressTracker.getTotalStars();
        document.getElementById('total-words').textContent = ProgressTracker.getWordsLearned().length;

        document.querySelectorAll('.level-btn').forEach(btn => {
            const level = btn.dataset.level;
            const unlockNum = parseInt(btn.dataset.unlock);

            if (ProgressTracker.isLevelUnlocked(unlockNum)) {
                btn.classList.remove('locked');
            } else {
                btn.classList.add('locked');
            }

            if (ProgressTracker.isLevelCompleted(level)) {
                btn.classList.add('completed');
            } else {
                btn.classList.remove('completed');
            }

            const progressFill = btn.querySelector('.level-progress-fill');
            const progress = ProgressTracker.getLevelProgress(level);
            progressFill.style.width = `${progress}%`;
        });
    },

    showLockedMessage() {
        const exerciseArea = document.getElementById('exercise-area');
        exerciseArea.innerHTML = `
            <div class="feedback info">
                <p>🔒 This level is locked!</p>
                <p>Complete the previous level to unlock it.</p>
            </div>
        `;
    },

    startLevel(level) {
        this.currentLevel = level;
        this.currentExerciseIndex = 0;
        this.exerciseResults = [];

        const levelInfo = IsiZuluData.levelNames[level];
        document.getElementById('level-title').textContent = `${levelInfo.zulu} - ${levelInfo.english}`;

        this.generateExercises();
        this.renderExercise();
        this.updateNavButtons();
        this.showScreen('level');
    },

    generateExercises() {
        this.exercises = [];

        switch (this.currentLevel) {
            case 'letters':
                this.generateLetterExercises();
                break;
            case 'syllables':
                this.generateSyllableExercises();
                break;
            case 'words':
                this.generateWordExercises();
                break;
            case 'sentences':
                this.generateSentenceExercises();
                break;
            case 'stories':
                this.generateStoryExercises();
                break;
        }
    },

    generateLetterExercises() {
        const letters = Object.keys(IsiZuluData.letters);
        letters.forEach((letter, index) => {
            const letterData = IsiZuluData.letters[letter];
            const exerciseType = index % 3;

            if (exerciseType === 0) {
                this.exercises.push({
                    type: 'letter-identify',
                    letter: letter,
                    data: letterData,
                    instruction: `Listen and find the letter:`,
                    correctAnswer: letter
                });
            } else if (exerciseType === 1) {
                const distractors = this.getRandomLetters(3, letter);
                const options = this.shuffleArray([letter, ...distractors]);
                this.exercises.push({
                    type: 'letter-match',
                    letter: letter,
                    data: letterData,
                    instruction: `Which letter makes the sound "${letterData.sound}"?`,
                    options: options,
                    correctAnswer: letter
                });
            } else {
                const distractors = this.getRandomLetters(3, letter);
                const options = this.shuffleArray([letter, ...distractors]);
                this.exercises.push({
                    type: 'letter-sound',
                    letter: letter,
                    data: letterData,
                    instruction: `What is the sound of letter "${letter.toUpperCase()}"?`,
                    options: options,
                    correctAnswer: letter
                });
            }
        });
    },

    generateSyllableExercises() {
        const categories = Object.keys(IsiZuluData.syllables);
        categories.forEach(category => {
            const syllables = IsiZuluData.syllables[category];
            syllables.forEach((syl, index) => {
                if (index % 3 === 0) {
                    const distractors = this.getRandomSyllables(3, syl.syllable, category);
                    const options = this.shuffleArray([syl.syllable, ...distractors]);
                    this.exercises.push({
                        type: 'syllable-match',
                        syllable: syl.syllable,
                        category: category,
                        instruction: `Which syllable makes the sound "${syl.sound}"?`,
                        options: options,
                        correctAnswer: syl.syllable
                    });
                } else if (index % 3 === 1) {
                    const distractors = this.getRandomSyllables(3, syl.syllable, category);
                    const options = this.shuffleArray([syl.syllable, ...distractors]);
                    this.exercises.push({
                        type: 'syllable-identify',
                        syllable: syl.syllable,
                        category: category,
                        instruction: `Find the syllable:`,
                        options: options,
                        correctAnswer: syl.syllable
                    });
                } else {
                    const distractors = this.getRandomSyllables(3, syl.syllable, category);
                    const options = this.shuffleArray([syl.syllable, ...distractors]);
                    this.exercises.push({
                        type: 'syllable-read',
                        syllable: syl.syllable,
                        category: category,
                        instruction: `Read this syllable aloud and click to check:`,
                        options: options,
                        correctAnswer: syl.syllable
                    });
                }
            });
        });
    },

    generateWordExercises() {
        const categories = Object.keys(IsiZuluData.words);
        categories.forEach(category => {
            const words = IsiZuluData.words[category];
            words.forEach((wordObj, index) => {
                if (index % 2 === 0) {
                    const distractors = this.getRandomWords(3, wordObj, category);
                    const options = this.shuffleArray([
                        { word: wordObj.word, meaning: wordObj.meaning },
                        ...distractors
                    ]);
                    this.exercises.push({
                        type: 'word-match',
                        word: wordObj,
                        category: category,
                        instruction: `Match the word to its meaning:`,
                        options: options,
                        correctAnswer: wordObj.word
                    });
                } else {
                    const distractors = this.getRandomWords(3, wordObj, category);
                    const options = this.shuffleArray([
                        { word: wordObj.word, meaning: wordObj.meaning },
                        ...distractors
                    ]);
                    this.exercises.push({
                        type: 'word-identify',
                        word: wordObj,
                        category: category,
                        instruction: `Which word means "${wordObj.meaning}"?`,
                        options: options,
                        correctAnswer: wordObj.word
                    });
                }
            });
        });
    },

    generateSentenceExercises() {
        const categories = Object.keys(IsiZuluData.sentences);
        categories.forEach(category => {
            const sentences = IsiZuluData.sentences[category];
            sentences.forEach((sentObj, index) => {
                if (index % 2 === 0) {
                    const distractors = this.getRandomSentences(2, sentObj, category);
                    const options = this.shuffleArray([sentObj, ...distractors]);
                    this.exercises.push({
                        type: 'sentence-translate',
                        sentence: sentObj,
                        category: category,
                        instruction: `Which English translation matches this sentence?`,
                        options: options,
                        correctAnswer: sentObj.meaning
                    });
                } else {
                    this.exercises.push({
                        type: 'sentence-read',
                        sentence: sentObj,
                        category: category,
                        instruction: `Read this sentence aloud:`,
                        correctAnswer: sentObj.sentence
                    });
                }
            });
        });
    },

    generateStoryExercises() {
        const stories = Object.keys(IsiZuluData.stories);
        stories.forEach(storyKey => {
            const story = IsiZuluData.stories[storyKey];
            this.exercises.push({
                type: 'story-read',
                story: story,
                instruction: `Read the story and click each paragraph to hear it read aloud.`
            });

            const shuffledParagraphs = this.shuffleArray([...story.paragraphs]);
            const para = shuffledParagraphs[0];
            this.exercises.push({
                type: 'story-translate',
                story: story,
                instruction: `Which English translation matches this paragraph?`,
                options: this.shuffleArray([para, ...shuffledParagraphs.slice(1, 4)]),
                correctAnswer: para.english
            });
        });
    },

    renderExercise() {
        const area = document.getElementById('exercise-area');
        const exercise = this.exercises[this.currentExerciseIndex];

        if (!exercise) return;

        let html = '';

        switch (exercise.type) {
            case 'letter-identify':
            case 'letter-match':
            case 'letter-sound':
                html = this.renderLetterExercise(exercise);
                break;
            case 'syllable-match':
            case 'syllable-identify':
            case 'syllable-read':
                html = this.renderSyllableExercise(exercise);
                break;
            case 'word-match':
            case 'word-identify':
                html = this.renderWordExercise(exercise);
                break;
            case 'sentence-translate':
            case 'sentence-read':
                html = this.renderSentenceExercise(exercise);
                break;
            case 'story-read':
            case 'story-translate':
                html = this.renderStoryExercise(exercise);
                break;
        }

        area.innerHTML = html;
        this.bindExerciseEvents(exercise);
        this.updateDots();
    },

    renderLetterExercise(exercise) {
        const letterData = exercise.data;
        const optionsHtml = exercise.options ? exercise.options.map(opt => `
            <button class="option-btn" data-answer="${opt}">${opt.toUpperCase()}</button>
        `).join('') : '';

        return `
            <div class="exercise-instruction">${exercise.instruction}</div>
            <div class="letter-display">
                <div class="letter-big" id="play-letter" data-letter="${exercise.letter}">${exercise.letter.toUpperCase()}</div>
                <div class="letter-example">${letterData.exampleWord} (${letterData.meaning})</div>
            </div>
            ${optionsHtml ? `<div class="options-grid">${optionsHtml}</div>` : ''}
            <button class="sound-btn" id="play-sound-btn">🔊</button>
            <div id="feedback-area"></div>
        `;
    },

    renderSyllableExercise(exercise) {
        const optionsHtml = exercise.options.map(opt => `
            <button class="option-btn" data-answer="${opt}">${opt}</button>
        `).join('');

        return `
            <div class="exercise-instruction">${exercise.instruction}</div>
            <div class="exercise-prompt">${exercise.syllable}</div>
            <div class="options-grid">${optionsHtml}</div>
            <button class="sound-btn" id="play-sound-btn">🔊</button>
            <div id="feedback-area"></div>
        `;
    },

    renderWordExercise(exercise) {
        const wordObj = exercise.word;
        const optionsHtml = exercise.options.map(opt => `
            <button class="option-btn" data-answer="${opt.word}">${opt.meaning}</button>
        `).join('');

        return `
            <div class="exercise-instruction">${exercise.instruction}</div>
            <div class="word-card">
                <div class="word" id="play-word">${wordObj.word}</div>
                <div class="meaning">${wordObj.meaning}</div>
            </div>
            <div class="options-grid">${optionsHtml}</div>
            <button class="sound-btn" id="play-sound-btn">🔊</button>
            <div id="feedback-area"></div>
        `;
    },

    renderSentenceExercise(exercise) {
        const sentObj = exercise.sentence;

        if (exercise.type === 'sentence-read') {
            return `
                <div class="exercise-instruction">${exercise.instruction}</div>
                <div class="sentence-display" id="play-sentence">${sentObj.sentence}</div>
                <div class="exercise-prompt-small">${sentObj.meaning}</div>
                <button class="sound-btn" id="play-sound-btn">🔊</button>
                <button class="check-btn" id="check-read">I've read it! ✓</button>
                <div id="feedback-area"></div>
            `;
        }

        const optionsHtml = exercise.options.map(opt => `
            <button class="option-btn" data-answer="${opt.meaning}">${opt.meaning}</button>
        `).join('');

        return `
            <div class="exercise-instruction">${exercise.instruction}</div>
            <div class="sentence-display" id="play-sentence">${sentObj.sentence}</div>
            <div class="options-grid">${optionsHtml}</div>
            <button class="sound-btn" id="play-sound-btn">🔊</button>
            <div id="feedback-area"></div>
        `;
    },

    renderStoryExercise(exercise) {
        if (exercise.type === 'story-read') {
            const paragraphsHtml = exercise.story.paragraphs.map((p, i) => `
                <div class="story-paragraph" data-index="${i}" data-zulu="${p.zulu}" data-english="${p.english}">
                    <p><strong>${p.zulu}</strong></p>
                    <p class="exercise-prompt-small">${p.english}</p>
                </div>
            `).join('');

            return `
                <div class="exercise-instruction">${exercise.instruction}</div>
                <h3 style="text-align:center; margin-bottom:15px;">${exercise.story.title}</h3>
                <div class="story-display">${paragraphsHtml}</div>
                <button class="check-btn" id="story-done">I've read the story! ✓</button>
                <div id="feedback-area"></div>
            `;
        }

        const optionsHtml = exercise.options.map(opt => `
            <button class="option-btn" data-answer="${opt.english}">${opt.english}</button>
        `).join('');

        return `
            <div class="exercise-instruction">${exercise.instruction}</div>
            <div class="exercise-prompt-word" id="play-story-sentence" style="cursor:pointer;">
                ${exercise.options[0].zulu}
            </div>
            <div class="options-grid">${optionsHtml}</div>
            <button class="sound-btn" id="play-sound-btn">🔊</button>
            <div id="feedback-area"></div>
        `;
    },

    bindExerciseEvents(exercise) {
        const playBtn = document.getElementById('play-sound-btn');
        if (playBtn) {
            playBtn.addEventListener('click', () => {
                this.playCurrentExerciseSound(exercise);
            });
        }

        const letterBig = document.getElementById('play-letter');
        if (letterBig) {
            letterBig.addEventListener('click', () => {
                letterBig.classList.add('playing');
                AudioEngine.playLetterSound(exercise.letter).then(() => {
                    letterBig.classList.remove('playing');
                });
            });
        }

        const playWord = document.getElementById('play-word');
        if (playWord) {
            playWord.addEventListener('click', () => {
                AudioEngine.playWord(exercise.word.word);
            });
        }

        const playSentence = document.getElementById('play-sentence');
        if (playSentence) {
            playSentence.addEventListener('click', () => {
                AudioEngine.playSentence(exercise.sentence.sentence);
            });
        }

        const playStorySentence = document.getElementById('play-story-sentence');
        if (playStorySentence) {
            playStorySentence.addEventListener('click', () => {
                AudioEngine.playSentence(exercise.options[0].zulu);
            });
        }

        document.querySelectorAll('.option-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.handleOptionClick(btn, exercise);
            });
        });

        const storyParagraphs = document.querySelectorAll('.story-paragraph');
        storyParagraphs.forEach(para => {
            para.addEventListener('click', () => {
                AudioEngine.playSentence(para.dataset.zulu);
                para.classList.add('read');
            });
        });

        const storyDone = document.getElementById('story-done');
        if (storyDone) {
            storyDone.addEventListener('click', () => {
                this.showFeedback(true, 'Great job reading the story!');
                ProgressTracker.completeExercise(this.currentLevel, this.currentExerciseIndex);
                this.exerciseResults.push(true);
            });
        }

        const checkRead = document.getElementById('check-read');
        if (checkRead) {
            checkRead.addEventListener('click', () => {
                this.showFeedback(true, 'Well done! You read the sentence!');
                ProgressTracker.completeExercise(this.currentLevel, this.currentExerciseIndex);
                this.exerciseResults.push(true);
            });
        }
    },

    playCurrentExerciseSound(exercise) {
        switch (exercise.type) {
            case 'letter-identify':
            case 'letter-match':
            case 'letter-sound':
                AudioEngine.playLetterSound(exercise.letter);
                break;
            case 'syllable-match':
            case 'syllable-identify':
            case 'syllable-read':
                AudioEngine.playSyllable(exercise.syllable);
                break;
            case 'word-match':
            case 'word-identify':
                AudioEngine.playWord(exercise.word.word);
                break;
            case 'sentence-translate':
            case 'sentence-read':
                AudioEngine.playSentence(exercise.sentence.sentence);
                break;
            case 'story-translate':
                AudioEngine.playSentence(exercise.options[0].zulu);
                break;
        }
    },

    handleOptionClick(btn, exercise) {
        const answer = btn.dataset.answer;
        const isCorrect = answer === exercise.correctAnswer;

        document.querySelectorAll('.option-btn').forEach(b => b.classList.add('disabled'));

        if (isCorrect) {
            btn.classList.add('correct');
            this.showFeedback(true, 'Kuhle kakhulu! (Very good!)');
            ProgressTracker.completeExercise(this.currentLevel, this.currentExerciseIndex);

            if (this.currentLevel === 'words') {
                ProgressTracker.addWordLearned(exercise.word.word);
            }

            this.exerciseResults.push(true);
            AudioEngine.playCorrectSound();
        } else {
            btn.classList.add('incorrect');
            document.querySelectorAll('.option-btn').forEach(b => {
                if (b.dataset.answer === exercise.correctAnswer) {
                    b.classList.add('correct');
                }
            });
            this.showFeedback(false, `The correct answer is: ${exercise.correctAnswer}`);
            this.exerciseResults.push(false);
            AudioEngine.playIncorrectSound();
        }
    },

    showFeedback(isCorrect, message) {
        const feedbackArea = document.getElementById('feedback-area');
        feedbackArea.innerHTML = `
            <div class="feedback ${isCorrect ? 'correct' : 'incorrect'}">
                ${isCorrect ? '✓' : '✗'} ${message}
            </div>
        `;
    },

    updateNavButtons() {
        const prevBtn = document.getElementById('prev-exercise');
        const nextBtn = document.getElementById('next-exercise');

        prevBtn.disabled = this.currentExerciseIndex === 0;

        if (this.currentExerciseIndex === this.exercises.length - 1) {
            nextBtn.textContent = 'Finish →';
        } else {
            nextBtn.textContent = 'Next →';
        }
    },

    updateDots() {
        const dotsContainer = document.getElementById('exercise-dots');
        const maxDots = Math.min(this.exercises.length, 10);
        let html = '';

        for (let i = 0; i < maxDots; i++) {
            const isActive = i === this.currentExerciseIndex;
            const isCompleted = ProgressTracker.isExerciseCompleted(this.currentLevel, i);
            html += `<div class="dot ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}"></div>`;
        }

        if (this.exercises.length > maxDots) {
            html += `<div class="dot">...</div>`;
        }

        dotsContainer.innerHTML = html;
    },

    finishLevel() {
        const correctCount = this.exerciseResults.filter(r => r).length;
        const totalExercises = this.exerciseResults.length;
        const percentage = totalExercises > 0 ? Math.round((correctCount / totalExercises) * 100) : 0;
        let stars = 0;
        if (percentage >= 90) stars = 3;
        else if (percentage >= 70) stars = 2;
        else if (percentage >= 50) stars = 1;

        ProgressTracker.completeLevel(this.currentLevel);
        ProgressTracker.awardStars(this.currentLevel, 0, stars);

        const starsHtml = '⭐'.repeat(stars) + '☆'.repeat(3 - stars);

        const area = document.getElementById('exercise-area');
        area.innerHTML = `
            <div style="text-align:center; padding:40px 20px;">
                <h2 style="margin-bottom:20px;">Level Complete!</h2>
                <div style="font-size:3em; margin:20px 0;">${starsHtml}</div>
                <p style="font-size:1.2em; margin:10px 0;">
                    You got <strong>${correctCount}</strong> out of <strong>${totalExercises}</strong> correct!
                </p>
                <p style="font-size:1em; color: #666; margin:5px 0;">
                    ${percentage}% accuracy
                </p>
                <p style="font-size:1.1em; margin:15px 0; color: #4CAF50;">
                    ${stars === 3 ? 'Amakhosi! (Champion!)' : stars === 2 ? 'Kuhle! (Good!)' : 'Uqhubeka! (Keep going!)'}
                </p>
                <button class="check-btn" id="back-home-btn" style="max-width:300px; margin:20px auto;">
                    Back to Home
                </button>
            </div>
        `;

        if (stars === 3) {
            this.showConfetti();
        }

        document.getElementById('back-home-btn').addEventListener('click', () => {
            this.showScreen('home');
            this.updateHomeScreen();
        });
    },

    showConfetti() {
        const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#FFD93D'];
        for (let i = 0; i < 50; i++) {
            const confetti = document.createElement('div');
            confetti.className = 'confetti';
            confetti.style.left = Math.random() * 100 + 'vw';
            confetti.style.background = colors[Math.floor(Math.random() * colors.length)];
            confetti.style.animationDuration = (Math.random() * 2 + 1) + 's';
            confetti.style.animationDelay = Math.random() * 2 + 's';
            confetti.style.width = (Math.random() * 10 + 5) + 'px';
            confetti.style.height = (Math.random() * 10 + 5) + 'px';
            document.body.appendChild(confetti);
            setTimeout(() => confetti.remove(), 5000);
        }
    },

    getRandomLetters(count, exclude) {
        const letters = Object.keys(IsiZuluData.letters).filter(l => l !== exclude);
        return this.shuffleArray(letters).slice(0, count);
    },

    getRandomSyllables(count, exclude, category) {
        const syllables = IsiZuluData.syllables[category]
            .filter(s => s.syllable !== exclude)
            .map(s => s.syllable);
        return this.shuffleArray(syllables).slice(0, count);
    },

    getRandomWords(count, exclude, category) {
        const words = IsiZuluData.words[category]
            .filter(w => w.word !== exclude.word);
        return this.shuffleArray(words).slice(0, count);
    },

    getRandomSentences(count, exclude, category) {
        const sentences = IsiZuluData.sentences[category]
            .filter(s => s.sentence !== exclude.sentence);
        return this.shuffleArray(sentences).slice(0, count);
    },

    shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }
};

document.addEventListener('DOMContentLoaded', () => {
    App.init();
});
