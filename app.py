from flask import Flask, render_template, jsonify, session, redirect, url_for, request, flash
from werkzeug.security import generate_password_hash, check_password_hash
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import os

app = Flask(__name__)
app.secret_key = os.urandom(24)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///users.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(200), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    progress = db.Column(db.JSON, default=lambda: {
        'currentLevel': 'letters',
        'unlockedLevel': 1,
        'completedLevels': [],
        'completedExercises': {},
        'stars': {},
        'wordsLearned': [],
        'totalStars': 0,
        'sessionCount': 0,
        'lastPlayed': None
    })

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

def login_required(f):
    from functools import wraps
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user_id' not in session:
            flash('Please login first!', 'warning')
            return redirect(url_for('login'))
        return f(*args, **kwargs)
    return decorated_function

@app.route('/')
def index():
    if 'user_id' in session:
        return redirect(url_for('game'))
    return redirect(url_for('login'))

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form.get('username')
        password = request.form.get('password')
        
        user = User.query.filter_by(username=username).first()
        
        if user and user.check_password(password):
            session['user_id'] = user.id
            session['username'] = user.username
            flash('Welcome back!', 'success')
            return redirect(url_for('game'))
        else:
            flash('Invalid username or password!', 'danger')
    
    return render_template('login.html')

@app.route('/signup', methods=['GET', 'POST'])
def signup():
    if request.method == 'POST':
        username = request.form.get('username')
        email = request.form.get('email')
        password = request.form.get('password')
        confirm_password = request.form.get('confirm_password')
        
        if password != confirm_password:
            flash('Passwords do not match!', 'danger')
            return render_template('signup.html')
        
        if User.query.filter_by(username=username).first():
            flash('Username already exists!', 'danger')
            return render_template('signup.html')
        
        if User.query.filter_by(email=email).first():
            flash('Email already registered!', 'danger')
            return render_template('signup.html')
        
        user = User(username=username, email=email)
        user.set_password(password)
        db.session.add(user)
        db.session.commit()
        
        session['user_id'] = user.id
        session['username'] = user.username
        flash('Account created successfully!', 'success')
        return redirect(url_for('game'))
    
    return render_template('signup.html')

@app.route('/logout')
def logout():
    session.clear()
    flash('You have been logged out.', 'info')
    return redirect(url_for('login'))

@app.route('/game')
@login_required
def game():
    return render_template('index.html')

@app.route('/api/progress', methods=['GET'])
@login_required
def get_progress():
    user = User.query.get(session['user_id'])
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    progress = user.progress or {}
    progress['sessionCount'] = progress.get('sessionCount', 0) + 1
    progress['lastPlayed'] = datetime.now().isoformat()
    user.progress = progress
    db.session.commit()
    
    return jsonify(progress)

@app.route('/api/progress', methods=['POST'])
@login_required
def save_progress():
    user = User.query.get(session['user_id'])
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    data = request.get_json()
    user.progress.update(data)
    db.session.commit()
    
    return jsonify({'status': 'ok'})

@app.route('/api/progress/complete-exercise', methods=['POST'])
@login_required
def complete_exercise():
    user = User.query.get(session['user_id'])
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    data = request.get_json()
    level = data.get('level')
    exercise_index = data.get('exerciseIndex')
    
    progress = user.progress or {}
    if level not in progress.get('completedExercises', {}):
        progress.setdefault('completedExercises', {})[level] = []
    
    if exercise_index not in progress['completedExercises'][level]:
        progress['completedExercises'][level].append(exercise_index)
    
    user.progress = progress
    db.session.commit()
    
    return jsonify({'status': 'ok'})

@app.route('/api/progress/complete-level', methods=['POST'])
@login_required
def complete_level():
    user = User.query.get(session['user_id'])
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    data = request.get_json()
    level = data.get('level')
    
    progress = user.progress or {}
    if level not in progress.get('completedLevels', []):
        progress.setdefault('completedLevels', []).append(level)
    
    if progress.get('unlockedLevel', 1) < 5:
        progress['unlockedLevel'] = progress.get('unlockedLevel', 1) + 1
    
    user.progress = progress
    db.session.commit()
    
    return jsonify({'status': 'ok'})

@app.route('/api/progress/award-stars', methods=['POST'])
@login_required
def award_stars():
    user = User.query.get(session['user_id'])
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    data = request.get_json()
    level = data.get('level')
    exercise_index = data.get('exerciseIndex')
    star_count = data.get('starCount', 0)
    
    progress = user.progress or {'stars': {}, 'totalStars': 0}
    key = f"{level}_{exercise_index}"
    current = progress.get('stars', {}).get(key, 0)
    
    if star_count > current:
        progress.setdefault('stars', {})[key] = star_count
    
    total = sum(progress.get('stars', {}).values())
    progress['totalStars'] = total
    
    user.progress = progress
    db.session.commit()
    
    return jsonify({'status': 'ok', 'totalStars': total})

@app.route('/api/progress/add-word', methods=['POST'])
@login_required
def add_word():
    user = User.query.get(session['user_id'])
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    data = request.get_json()
    word = data.get('word')
    
    progress = user.progress or {'wordsLearned': []}
    if word not in progress.get('wordsLearned', []):
        progress.setdefault('wordsLearned', []).append(word)
    
    user.progress = progress
    db.session.commit()
    
    return jsonify({'status': 'ok'})

@app.route('/api/progress/reset', methods=['POST'])
@login_required
def reset_progress():
    user = User.query.get(session['user_id'])
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    user.progress = {
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
    db.session.commit()
    
    return jsonify({'status': 'ok'})

@app.route('/api/user/profile', methods=['GET'])
@login_required
def get_profile():
    user = User.query.get(session['user_id'])
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    return jsonify({
        'username': user.username,
        'email': user.email,
        'created_at': user.created_at.isoformat(),
        'total_stars': user.progress.get('totalStars', 0) if user.progress else 0,
        'words_learned': len(user.progress.get('wordsLearned', [])) if user.progress else 0
    })

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True, port=5000)
