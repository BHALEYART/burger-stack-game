# Burger Stack Game 🍔

A fun 3D stacking game built with Three.js where you stack burger layers as high as you can!

## Play the Game

[Play Live on GitHub Pages](https://bhaleyart.github.io/burger-stack-game/)

## Features

- 🎮 Simple one-tap gameplay
- 🍔 4 different burger types with unique layers
- ⚡ Perfect placement mechanics with visual feedback
- 📈 Progressive difficulty that increases speed
- 🏆 High score tracking
- 📱 Mobile-friendly responsive design

## How to Deploy to GitHub Pages

### Option 1: Quick Deploy (Recommended)

1. **Create a new repository on GitHub**
   - Go to https://github.com/new
   - Name it `burger-stack-game` (or any name you prefer)
   - Make it public
   - Don't initialize with README

2. **Upload your files**
   - Click "uploading an existing file"
   - Drag and drop these files:
     - `index.html`
     - `game.js`
   - Commit the files

3. **Enable GitHub Pages**
   - Go to repository Settings
   - Scroll to "Pages" section
   - Under "Source", select "main" branch
   - Click Save
   - Wait 1-2 minutes for deployment

4. **Access your game**
   - Visit: `https://your-username.github.io/burger-stack-game/`

### Option 2: Using Git Command Line

```bash
# Navigate to your project folder
cd burger-stack-game

# Initialize git repository
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit - Burger Stack Game"

# Add remote repository
git remote add origin https://github.com/YOUR-USERNAME/burger-stack-game.git

# Push to GitHub
git branch -M main
git push -u origin main
```

Then follow step 3 from Option 1 to enable GitHub Pages.

## Local Development

To run locally, you'll need a local web server because of ES6 modules:

```bash
# Using Python 3
python -m http.server 8000

# Using Node.js
npx http-server

# Using PHP
php -S localhost:8000
```

Then open `http://localhost:8000` in your browser.

## Game Controls

- **Click/Tap** - Drop the burger layer
- **Perfect Drop** - Get 3 perfect drops in a row to restore block size!

## Technologies Used

- Three.js (3D graphics)
- Vanilla JavaScript (ES6 modules)
- HTML5 Canvas

## License

MIT License - Feel free to use and modify!
