# Background Music for Power Cabinet

Place your background music file here as `background.mp3`.

## Requirements
- **Format:** MP3 (or WAV/AAC supported by expo-audio)
- **Duration:** 2-3 minutes recommended (for seamless looping)
- **License:** Must be royalty-free or CC-licensed

## Recommended Free Sources (CC BY / Royalty-Free)

### 1. **Free Music Archive** (freemusicarchive.org)
- Search terms: "ambient", "political", "tense", "orchestral", "background"
- Filter by: CC BY license
- Excellent for game backgrounds

### 2. **Bensound** (bensound.com)
- **License:** CC BY 3.0 (free for non-commercial)
- High-quality, professionally produced loops
- Categories: Ambient, Corporate, Cinematic
- Recommended: "Sunny" or "Inspire" or "Tense" tracks

### 3. **Incompetech** (incompetech.com)
- **Creator:** Kevin MacLeod
- **License:** CC BY 3.0
- Thousands of royalty-free music tracks
- Search: "political", "background", "tension", "dramatic"

### 4. **YouTube Audio Library** (youtube.com/audiolibrary)
- Free, curated music library
- CC-licensed
- Browse by mood/genre

### 5. **OpenGameArt.org** (opengameart.org)
- Community-created game music
- CC-licensed
- Specifically designed for game backgrounds

## Suggested Music Genres for Power Cabinet
Given the political satire theme, consider:
- **Dramatic orchestral** (conveys political intrigue)
- **Ambient electronic** (modern, sophisticated)
- **Tense/suspenseful** (game-like atmosphere)
- **Cinematic** (stakes and drama)

## Testing
1. Download a 2-3 minute CC BY royalty-free track
2. Convert to MP3 (if needed) using ffmpeg:
   ```bash
   ffmpeg -i input.wav output.mp3
   ```
3. Save as `assets/music/background.mp3`
4. Run the app: `npm start`
5. Go to Settings and toggle "Background music"

## Notes
- Music loops automatically when it reaches the end
- Users can toggle on/off in Settings
- Default volume: 30% (non-intrusive during gameplay)
- Volume persists across sessions via AsyncStorage
