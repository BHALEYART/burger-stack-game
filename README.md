# Big Head Billionaires - Burger Stacker Game 🍔

A polished 3D stacking mini-game built with Three.js. Stack burgers as high as you can and try to beat the music!

Created by **B.HaleyArt**

## Play the Game

[Play Live on GitHub Pages](https://bhaleyart.github.io/burger-stack-game/)

## Features

- 🎮 **Simple one-tap gameplay** - Click or tap to drop burgers
- 🍔 **4 different burger types** with unique layers
- 🎵 **Original music track** - Can you beat the song before game over?
- 🔇 **Mute button** - Toggle music on/off
- ⚡ **Perfect placement mechanics** - White flash on perfect drops
- 🎯 **Comeback system** - 3 perfect drops = size restored
- 📈 **Progressive difficulty** - Speed increases every 8 burgers
- 🏆 **High score tracking** - Beat your best score
- 📱 **Mobile-friendly** - Works on phones, tablets, and desktop
- 🎨 **Professional UI** - Start menu, game over screen, and credits
- 🎬 **YouTube integration** - Link to B.HaleyArt's channel on game over
- 🎨 **Slate-themed design** - Matches modern interface aesthetics

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
     - `README.md`
     - `screenshot.png` (take a screenshot of the game in action)
   - Commit the files

3. **Add a screenshot for social sharing**
   - Play the game and take a screenshot
   - Save it as `screenshot.png` (1200x630px recommended for social media)
   - Upload to your repository
   - Update the meta image URLs in `index.html`:
     - Replace `your-username` with your GitHub username
     - The URLs should look like: `https://your-username.github.io/burger-stack-game/screenshot.png`

4. **Enable GitHub Pages**
   - Go to repository Settings
   - Scroll to "Pages" section
   - Under "Source", select "main" branch
   - Click Save
   - Wait 1-2 minutes for deployment

5. **Access your game**
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

| Platform | Action | Control |
|----------|--------|---------|
| Desktop | Drop burger | Left click |
| Mobile | Drop burger | Tap anywhere on screen |
| All | Restart game | Click/Tap after Game Over |
| All | Mute/Unmute music | Click 🔊 button (top right) |
| Game Over | Visit YouTube | Click "Visit B.HaleyArt" button |

## How to Play

1. **Start** - Click "START GAME" on the menu
2. **Stack** - Click/tap to drop each burger layer
3. **Survive** - Keep stacking without missing
4. **Challenge** - Try to beat the 90-second music track!
5. **Perfect Drops** - Get 3 perfect drops in a row to restore block size

## Winning Condition

**Beat the music!** If you can keep stacking burgers until the song ends (90 seconds), you win! The music stops when you lose, so staying alive means the music keeps playing.

## Technologies Used

- **Three.js** - 3D graphics rendering
- **Web Audio API** - Procedural music generation
- **Vanilla JavaScript** - ES6 modules, no frameworks
- **HTML5 Canvas** - Hardware-accelerated rendering
- **CSS3** - Animations and responsive design

## SEO & Social Sharing

The game includes:
- Complete Open Graph tags for Facebook
- Twitter Card support
- Custom meta descriptions and keywords
- Structured data for search engines
- Custom favicon (burger emoji 🍔)

When you share the link, it will show:
- **Title:** "Big Head Billionaires - Burger Stacker Game"
- **Description:** "Stack burgers as high as you can! Can you beat the music?"
- **Image:** Your screenshot (once uploaded)

## License

MIT License - Feel free to use and modify!
