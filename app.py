from flask import Flask, render_template, jsonify, session
import json
import os
from datetime import datetime

app = Flask(__name__)
app.secret_key = os.urandom(24)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/progress', methods=['GET'])
def get_progress():
    if 'progress' not in session:
        session['progress'] = {
            'currentLevel': 'letters',
            'unlockedLevel': 1,
            'completedLevels': [],
            'completedExercises': {},
            'stars': {},
            'wordsLearned': [],
            'totalStars': 0,
            'sessionCount': 0,
            'lastPlayed': None
        }
    progress = session['progress']
    progress['sessionCount'] = progress.get('sessionCount', 0) + 1
    progress['lastPlayed'] = datetime.now().isoformat()
    session['progress'] = progress
    return jsonify(progress)

@app.route('/api/progress', methods=['POST'])
def save_progress():
    from flask import request
    data = request.get_json()
    if 'progress' in session:
        session['progress'].update(data)
    else:
        session['progress'] = data
    return jsonify({'status': 'ok'})

@app.route('/api/progress/complete-exercise', methods=['POST'])
def complete_exercise():
    from flask import request
    data = request.get_json()
    level = data.get('level')
    exercise_index = data.get('exerciseIndex')

    if 'progress' not in session:
        session['progress'] = {
            'completedExercises': {},
            'wordsLearned': [],
            'totalStars': 0
        }

    progress = session['progress']
    if level not in progress.get('completedExercises', {}):
        progress.setdefault('completedExercises', {})[level] = []

    if exercise_index not in progress['completedExercises'][level]:
        progress['completedExercises'][level].append(exercise_index)

    session['progress'] = progress
    return jsonify({'status': 'ok'})

@app.route('/api/progress/complete-level', methods=['POST'])
def complete_level():
    from flask import request
    data = request.get_json()
    level = data.get('level')

    if 'progress' not in session:
        session['progress'] = {
            'completedLevels': [],
            'unlockedLevel': 1
        }

    progress = session['progress']
    if level not in progress.get('completedLevels', []):
        progress.setdefault('completedLevels', []).append(level)

    if progress.get('unlockedLevel', 1) < 5:
        progress['unlockedLevel'] = progress.get('unlockedLevel', 1) + 1

    session['progress'] = progress
    return jsonify({'status': 'ok'})

@app.route('/api/progress/award-stars', methods=['POST'])
def award_stars():
    from flask import request
    data = request.get_json()
    level = data.get('level')
    exercise_index = data.get('exerciseIndex')
    star_count = data.get('starCount', 0)

    if 'progress' not in session:
        session['progress'] = {'stars': {}, 'totalStars': 0}

    progress = session['progress']
    key = f"{level}_{exercise_index}"
    current = progress.get('stars', {}).get(key, 0)

    if star_count > current:
        progress.setdefault('stars', {})[key] = star_count

    total = sum(progress.get('stars', {}).values())
    progress['totalStars'] = total

    session['progress'] = progress
    return jsonify({'status': 'ok', 'totalStars': total})

@app.route('/api/progress/add-word', methods=['POST'])
def add_word():
    from flask import request
    data = request.get_json()
    word = data.get('word')

    if 'progress' not in session:
        session['progress'] = {'wordsLearned': []}

    progress = session['progress']
    if word not in progress.get('wordsLearned', []):
        progress.setdefault('wordsLearned', []).append(word)

    session['progress'] = progress
    return jsonify({'status': 'ok'})

@app.route('/api/progress/reset', methods=['POST'])
def reset_progress():
    session['progress'] = {
        'currentLevel': 'letters',
        'unlockedLevel': 1,
        'completedLevels': [],
        'completedExercises': {},
        'stars': {},
        'wordsLearned': [],
        'totalStars': 0,
        'sessionCount': 0,
        'lastPlayed': None
    }
    return jsonify({'status': 'ok'})

if __name__ == '__main__':
    app.run(debug=True, port=5000)
