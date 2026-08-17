# IsiZulu Reading Game - uHambo lweZwi

An interactive Flask web application designed to help beginners, especially children, learn to read isiZulu from the ground up.

## Features

- **5 Learning Levels**: Letters → Syllables → Words → Sentences → Stories
- **Audio Pronunciation**: Web Speech API for isiZulu pronunciation
- **Interactive Exercises**: Multiple choice, matching, and reading exercises
- **Progress Tracking**: Server-side session-based progress saving
- **Child-Friendly Design**: Colorful, responsive, and engaging interface
- **Gamification**: Stars, progress bars, and confetti celebrations

## Levels

### 1. Izinhlaka (Letters)
- Learn all isiZulu letters and their sounds
- Exercises: Letter identification, sound matching

### 2. Izingxenye (Syllables)
- Practice CV, CVC, and CCV syllable patterns
- Exercises: Syllable identification and pronunciation

### 3. Amagama (Words)
- Learn common isiZulu words across categories:
  - Animals (Izilwane)
  - People (Abantu)
  - Objects (Izinto)
  - Food (Izitsha)
  - Nature (Izinkomo)
  - Colors (Izibalo)

### 4. Izivakalisi (Sentences)
- Practice reading and understanding isiZulu sentences
- Simple, short, and long sentence exercises

### 5. Izindaba (Stories)
- Read interactive mini-stories in isiZulu
- Click paragraphs to hear them read aloud

## Technology

- **Backend**: Python, Flask
- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Audio**: Web Speech API
- **Storage**: Flask session for progress persistence
- **Template Engine**: Jinja2

## Getting Started

### Prerequisites
- Python 3.7 or higher
- pip (Python package manager)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/INNodangala/JOURNEY-IN-ZULU-WRODS.git
cd JOURNEY-IN-ZULU-WRODS
```

2. Create a virtual environment:
```bash
python -m venv venv
```

3. Activate the virtual environment:
- Windows:
```bash
venv\Scripts\activate
```
- macOS/Linux:
```bash
source venv/bin/activate
```

4. Install dependencies:
```bash
pip install -r requirements.txt
```

5. Run the application:
```bash
python app.py
```

6. Open your browser and go to:
```
http://localhost:5000
```

## Project Structure

```
JOURNEY-IN-ZULU-WRODS/
├── app.py                  # Flask application
├── requirements.txt        # Python dependencies
├── templates/
│   └── index.html          # Jinja2 template
├── static/
│   ├── css/
│   │   └── styles.css      # All styling
│   └── js/
│       ├── data.js         # isiZulu content data
│       ├── audio.js        # Web Speech API wrapper
│       ├── progress.js     # Progress tracking
│       └── app.js          # Main game controller
├── assets/                 # Future audio/image assets
├── LICENSE                 # GNU GPL v2
└── README.md               # This file
```

## API Endpoints

- `GET /` - Main application page
- `GET /api/progress` - Get user progress
- `POST /api/progress` - Save user progress
- `POST /api/progress/complete-exercise` - Mark exercise as completed
- `POST /api/progress/complete-level` - Mark level as completed
- `POST /api/progress/award-stars` - Award stars to user
- `POST /api/progress/add-word` - Add word to learned words
- `POST /api/progress/reset` - Reset all progress

## License

This project is licensed under the GNU General Public License v2.0 - see the LICENSE file for details.

## Contributing

Contributions are welcome! Feel free to:
- Add more isiZulu content
- Improve exercises
- Add new features
- Fix bugs
