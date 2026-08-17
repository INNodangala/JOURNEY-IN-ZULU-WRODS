const ProgressTracker = {
    STORAGE_KEY: 'izulu_reading_game_progress',

    data: {
        currentLevel: 'letters',
        unlockedLevel: 1,
        completedLevels: [],
        completedExercises: {},
        stars: {},
        wordsLearned: [],
        totalStars: 0,
        sessionCount: 0,
        lastPlayed: null
    },

    init() {
        this.load();
        this.data.sessionCount++;
        this.data.lastPlayed = new Date().toISOString();
        this.save();
    },

    load() {
        try {
            const stored = localStorage.getItem(this.STORAGE_KEY);
            if (stored) {
                this.data = { ...this.data, ...JSON.parse(stored) };
            }
        } catch (e) {
            console.warn('Could not load progress:', e);
        }
    },

    save() {
        try {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.data));
        } catch (e) {
            console.warn('Could not save progress:', e);
        }
    },

    completeExercise(level, exerciseIndex) {
        if (!this.data.completedExercises[level]) {
            this.data.completedExercises[level] = [];
        }
        if (!this.data.completedExercises[level].includes(exerciseIndex)) {
            this.data.completedExercises[level].push(exerciseIndex);
        }
        this.save();
    },

    isExerciseCompleted(level, exerciseIndex) {
        return this.data.completedExercises[level]?.includes(exerciseIndex) || false;
    },

    getCompletedCount(level) {
        return this.data.completedExercises[level]?.length || 0;
    },

    getTotalExercises(level) {
        switch (level) {
            case 'letters': return Object.keys(IsiZuluData.letters).length;
            case 'syllables': return IsiZuluData.syllables['CV (Consonant-Vowel)'].length +
                                      IsiZuluData.syllables['CVC (Consonant-Vowel-Consonant)'].length +
                                      IsiZuluData.syllables['CCV (Consonant Cluster-Vowel)'].length;
            case 'words': {
                let total = 0;
                for (const cat in IsiZuluData.words) {
                    total += IsiZuluData.words[cat].length;
                }
                return total;
            }
            case 'sentences': {
                let total = 0;
                for (const cat in IsiZuluData.sentences) {
                    total += IsiZuluData.sentences[cat].length;
                }
                return total;
            }
            case 'stories': return Object.keys(IsiZuluData.stories).length;
            default: return 0;
        }
    },

    getLevelProgress(level) {
        const completed = this.getCompletedCount(level);
        const total = this.getTotalExercises(level);
        return total > 0 ? Math.round((completed / total) * 100) : 0;
    },

    awardStars(level, exerciseIndex, starCount) {
        const key = `${level}_${exerciseIndex}`;
        const current = this.data.stars[key] || 0;
        if (starCount > current) {
            this.data.stars[key] = starCount;
        }
        this.calculateTotalStars();
        this.save();
    },

    getStars(level, exerciseIndex) {
        const key = `${level}_${exerciseIndex}`;
        return this.data.stars[key] || 0;
    },

    calculateTotalStars() {
        let total = 0;
        for (const key in this.data.stars) {
            total += this.data.stars[key];
        }
        this.data.totalStars = total;
    },

    getTotalStars() {
        return this.data.totalStars;
    },

    addWordLearned(word) {
        if (!this.data.wordsLearned.includes(word)) {
            this.data.wordsLearned.push(word);
        }
        this.save();
    },

    getWordsLearned() {
        return this.data.wordsLearned;
    },

    unlockNextLevel() {
        if (this.data.unlockedLevel < 5) {
            this.data.unlockedLevel++;
            this.save();
        }
    },

    isLevelUnlocked(levelNum) {
        return levelNum <= this.data.unlockedLevel;
    },

    completeLevel(level) {
        if (!this.data.completedLevels.includes(level)) {
            this.data.completedLevels.push(level);
        }
        this.unlockNextLevel();
        this.save();
    },

    isLevelCompleted(level) {
        return this.data.completedLevels.includes(level);
    },

    resetProgress() {
        this.data = {
            currentLevel: 'letters',
            unlockedLevel: 1,
            completedLevels: [],
            completedExercises: {},
            stars: {},
            wordsLearned: [],
            totalStars: 0,
            sessionCount: 0,
            lastPlayed: null
        };
        this.save();
    }
};
