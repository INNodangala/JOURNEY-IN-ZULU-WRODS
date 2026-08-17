const AudioEngine = {
    synth: window.speechSynthesis || null,
    voices: [],
    selectedVoice: null,
    isSpeaking: false,

    init() {
        if (!this.synth) {
            console.warn('Speech synthesis not supported');
            return;
        }
        this.loadVoices();
        if (this.synth.onvoiceschanged !== undefined) {
            this.synth.onvoiceschanged = () => this.loadVoices();
        }
    },

    loadVoices() {
        this.voices = this.synth.getVoices();
        this.selectedVoice = this.voices.find(v => v.lang.startsWith('zu')) ||
                             this.voices.find(v => v.lang.startsWith('af')) ||
                             this.voices.find(v => v.lang.startsWith('en'));
    },

    speak(text, rate = 0.8, pitch = 1.0) {
        return new Promise((resolve) => {
            if (!this.synth) {
                resolve();
                return;
            }
            this.synth.cancel();
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'zu-ZA';
            utterance.rate = rate;
            utterance.pitch = pitch;
            utterance.volume = 1.0;
            if (this.selectedVoice) {
                utterance.voice = this.selectedVoice;
            }
            utterance.onstart = () => {
                this.isSpeaking = true;
            };
            utterance.onend = () => {
                this.isSpeaking = false;
                resolve();
            };
            utterance.onerror = () => {
                this.isSpeaking = false;
                resolve();
            };
            this.synth.speak(utterance);
        });
    },

    speakSlow(text) {
        return this.speak(text, 0.6, 1.0);
    },

    speakNormal(text) {
        return this.speak(text, 0.8, 1.0);
    },

    speakFast(text) {
        return this.speak(text, 1.0, 1.0);
    },

    stop() {
        if (this.synth) {
            this.synth.cancel();
            this.isSpeaking = false;
        }
    },

    playLetterSound(letter) {
        const letterData = IsiZuluData.letters[letter];
        if (letterData) {
            return this.speak(letterData.name, 0.6, 1.0);
        }
        return this.speak(letter, 0.6, 1.0);
    },

    playSyllable(syllable) {
        return this.speak(syllable, 0.7, 1.0);
    },

    playWord(word) {
        return this.speak(word, 0.7, 1.0);
    },

    playSentence(sentence) {
        return this.speak(sentence, 0.8, 1.0);
    },

    playCorrectSound() {
        this.speak('Correct! Well done!', 1.0, 1.2);
    },

    playIncorrectSound() {
        this.speak('Try again!', 1.0, 0.8);
    }
};
