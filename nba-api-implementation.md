# NBA Live Data API Implementation Guide

This guide covers using the `nba_api` Python library to fetch live NBA game data including scores, box scores, and play-by-play updates.

## Installation

```bash
pip install nba_api
```

## Data Latency

- **Expected delay**: ~10-30 seconds behind live arena action
- **Data source**: `cdn.nba.com/static/json/liveData/`
- **Recommended polling interval**: 10-15 seconds during live games

---

## 1. Get Live Games for Today (ScoreBoard)

Returns all games scheduled for today with live scores and status.

### Basic Usage

```python
from nba_api.live.nba.endpoints import scoreboard

# Get today's scoreboard
board = scoreboard.ScoreBoard()
games = board.get_dict()

# Access games list
for game in games['scoreboard']['games']:
    print(f"Game ID: {game['gameId']}")
    print(f"{game['awayTeam']['teamTricode']} @ {game['homeTeam']['teamTricode']}")
    print(f"Score: {game['awayTeam']['score']} - {game['homeTeam']['score']}")
    print(f"Status: {game['gameStatusText']}")
    print("---")
```

### Response Structure

```python
{
    "scoreboard": {
        "gameDate": "2025-01-12",
        "games": [
            {
                "gameId": "0022400123",
                "gameStatus": 2,              # 1=Not Started, 2=In Progress, 3=Final
                "gameStatusText": "Q3 5:42",  # Human-readable status
                "period": 3,
                "gameClock": "PT05M42.00S",   # ISO 8601 duration format
                "homeTeam": {
                    "teamId": 1610612747,
                    "teamName": "Lakers",
                    "teamCity": "Los Angeles",
                    "teamTricode": "LAL",
                    "score": 78,
                    "inBonus": "1",
                    "timeoutsRemaining": 4,
                    "periods": [
                        {"period": 1, "score": 28},
                        {"period": 2, "score": 25},
                        {"period": 3, "score": 25}
                    ]
                },
                "awayTeam": {
                    "teamId": 1610612744,
                    "teamName": "Warriors",
                    "teamCity": "Golden State",
                    "teamTricode": "GSW",
                    "score": 82,
                    # ... same structure as homeTeam
                },
                "gameLeaders": {
                    "homeLeaders": {
                        "personId": 2544,
                        "name": "LeBron James",
                        "points": 24,
                        "rebounds": 8,
                        "assists": 6
                    },
                    "awayLeaders": {
                        # ... same structure
                    }
                }
            }
        ]
    }
}
```

### Helper Function

```python
from nba_api.live.nba.endpoints import scoreboard

def get_live_games():
    """Get all live/today's games with scores."""
    board = scoreboard.ScoreBoard()
    games = board.get_dict()['scoreboard']['games']

    result = []
    for game in games:
        result.append({
            'game_id': game['gameId'],
            'status': game['gameStatus'],          # 1=scheduled, 2=live, 3=final
            'status_text': game['gameStatusText'],
            'period': game['period'],
            'clock': parse_game_clock(game.get('gameClock', '')),
            'home': {
                'team': game['homeTeam']['teamTricode'],
                'name': game['homeTeam']['teamName'],
                'score': game['homeTeam']['score'],
                'timeouts': game['homeTeam']['timeoutsRemaining']
            },
            'away': {
                'team': game['awayTeam']['teamTricode'],
                'name': game['awayTeam']['teamName'],
                'score': game['awayTeam']['score'],
                'timeouts': game['awayTeam']['timeoutsRemaining']
            }
        })
    return result

def parse_game_clock(clock_str):
    """Convert ISO 8601 duration to MM:SS format."""
    if not clock_str or clock_str == '':
        return "0:00"
    # Format: PT05M42.00S -> 5:42
    import re
    match = re.match(r'PT(\d+)M([\d.]+)S', clock_str)
    if match:
        minutes = int(match.group(1))
        seconds = int(float(match.group(2)))
        return f"{minutes}:{seconds:02d}"
    return clock_str
```

---

## 2. Get Full Box Score

Returns complete game statistics including all player stats.

### Basic Usage

```python
from nba_api.live.nba.endpoints import boxscore

# Get box score for a specific game
game_id = "0022400123"  # Get this from ScoreBoard
box = boxscore.BoxScore(game_id=game_id)
data = box.get_dict()

game = data['game']

# Game info
print(f"Arena: {game['arena']['arenaName']}")
print(f"Period: {game['period']} | Clock: {game['gameClock']}")

# Team totals
home = game['homeTeam']
away = game['awayTeam']
print(f"\n{home['teamTricode']}: {home['score']} pts")
print(f"{away['teamTricode']}: {away['score']} pts")

# Player stats
for player in home['players']:
    stats = player['statistics']
    print(f"{player['name']}: {stats['points']} pts, {stats['reboundsTotal']} reb, {stats['assists']} ast")
```

### Response Structure

```python
{
    "game": {
        "gameId": "0022400123",
        "gameStatus": 2,
        "gameStatusText": "Q3 5:42",
        "period": 3,
        "gameClock": "PT05M42.00S",
        "arena": {
            "arenaId": 1,
            "arenaName": "Crypto.com Arena",
            "arenaCity": "Los Angeles",
            "arenaState": "CA"
        },
        "homeTeam": {
            "teamId": 1610612747,
            "teamTricode": "LAL",
            "score": 78,
            "inBonus": "1",
            "timeoutsRemaining": 4,
            "statistics": {
                "fieldGoalsMade": 30,
                "fieldGoalsAttempted": 65,
                "fieldGoalsPercentage": 0.462,
                "threePointersMade": 8,
                "threePointersAttempted": 24,
                "threePointersPercentage": 0.333,
                "freeThrowsMade": 10,
                "freeThrowsAttempted": 12,
                "reboundsOffensive": 8,
                "reboundsDefensive": 28,
                "reboundsTotal": 36,
                "assists": 22,
                "steals": 6,
                "blocks": 4,
                "turnovers": 10,
                "foulsPersonal": 15
            },
            "players": [
                {
                    "personId": 2544,
                    "name": "LeBron James",
                    "nameI": "L. James",
                    "jerseyNum": "23",
                    "position": "F",
                    "starter": "1",
                    "oncourt": "1",
                    "played": "1",
                    "statistics": {
                        "minutes": "PT28M15.00S",
                        "points": 24,
                        "fieldGoalsMade": 9,
                        "fieldGoalsAttempted": 16,
                        "fieldGoalsPercentage": 0.563,
                        "threePointersMade": 2,
                        "threePointersAttempted": 5,
                        "threePointersPercentage": 0.4,
                        "freeThrowsMade": 4,
                        "freeThrowsAttempted": 5,
                        "freeThrowsPercentage": 0.8,
                        "reboundsOffensive": 1,
                        "reboundsDefensive": 7,
                        "reboundsTotal": 8,
                        "assists": 6,
                        "steals": 2,
                        "blocks": 1,
                        "turnovers": 3,
                        "foulsPersonal": 2,
                        "plusMinusPoints": 12
                    }
                }
                // ... more players
            ]
        },
        "awayTeam": {
            // Same structure as homeTeam
        }
    }
}
```

### Helper Function

```python
from nba_api.live.nba.endpoints import boxscore

def get_box_score(game_id):
    """Get full box score for a game."""
    box = boxscore.BoxScore(game_id=game_id)
    data = box.get_dict()['game']

    def parse_team(team_data):
        return {
            'team': team_data['teamTricode'],
            'score': team_data['score'],
            'timeouts': team_data['timeoutsRemaining'],
            'in_bonus': team_data.get('inBonus') == '1',
            'stats': team_data['statistics'],
            'players': [
                {
                    'id': p['personId'],
                    'name': p['name'],
                    'jersey': p['jerseyNum'],
                    'position': p['position'],
                    'starter': p.get('starter') == '1',
                    'on_court': p.get('oncourt') == '1',
                    'stats': p['statistics']
                }
                for p in team_data['players']
                if p.get('played') == '1'
            ]
        }

    return {
        'game_id': data['gameId'],
        'status': data['gameStatus'],
        'status_text': data['gameStatusText'],
        'period': data['period'],
        'clock': parse_game_clock(data.get('gameClock', '')),
        'arena': data['arena']['arenaName'],
        'home': parse_team(data['homeTeam']),
        'away': parse_team(data['awayTeam'])
    }

def get_player_points(game_id):
    """Get just player scoring for a game."""
    box = boxscore.BoxScore(game_id=game_id)
    data = box.get_dict()['game']

    players = []
    for team in [data['homeTeam'], data['awayTeam']]:
        for p in team['players']:
            if p.get('played') == '1':
                players.append({
                    'name': p['name'],
                    'team': team['teamTricode'],
                    'points': p['statistics']['points'],
                    'fg': f"{p['statistics']['fieldGoalsMade']}/{p['statistics']['fieldGoalsAttempted']}",
                    'three': f"{p['statistics']['threePointersMade']}/{p['statistics']['threePointersAttempted']}",
                    'ft': f"{p['statistics']['freeThrowsMade']}/{p['statistics']['freeThrowsAttempted']}"
                })

    return sorted(players, key=lambda x: x['points'], reverse=True)
```

---

## 3. Get Play-by-Play

Returns every play in the game with timestamps and details.

### Basic Usage

```python
from nba_api.live.nba.endpoints import playbyplay

game_id = "0022400123"
pbp = playbyplay.PlayByPlay(game_id=game_id)
data = pbp.get_dict()

for action in data['game']['actions']:
    clock = action.get('clock', '')
    period = action.get('period', 0)
    desc = action.get('description', '')
    score = f"{action.get('scoreAway', 0)}-{action.get('scoreHome', 0)}"

    print(f"Q{period} {clock} | {score} | {desc}")
```

### Response Structure

```python
{
    "game": {
        "gameId": "0022400123",
        "actions": [
            {
                "actionNumber": 4,
                "clock": "PT11M42.00S",
                "timeActual": "2025-01-12T00:12:18.2Z",
                "period": 1,
                "periodType": "REGULAR",
                "actionType": "2pt",
                "subType": "Layup",
                "descriptor": "driving finger roll",
                "qualifiers": ["pointsinthepaint"],
                "personId": 2544,
                "playerName": "LeBron James",
                "playerNameI": "L. James",
                "teamId": 1610612747,
                "teamTricode": "LAL",
                "shotResult": "Made",
                "pointsTotal": 2,
                "isFieldGoal": 1,
                "scoreHome": "2",
                "scoreAway": "0",
                "description": "L. James driving finger roll Layup (2 PTS)",
                "x": 85.5,     # Court position (0-100)
                "y": 45.2,    # Court position (0-100)
                "possession": 1610612747,
                "edited": "2025-01-12T00:12:20.1Z"
            },
            {
                "actionNumber": 5,
                "clock": "PT11M25.00S",
                "period": 1,
                "actionType": "3pt",
                "subType": "Jump Shot",
                "descriptor": "pullup",
                "personId": 201939,
                "playerName": "Stephen Curry",
                "teamTricode": "GSW",
                "shotResult": "Made",
                "pointsTotal": 3,
                "scoreHome": "2",
                "scoreAway": "3",
                "description": "S. Curry pullup 3PT (3 PTS)"
            },
            {
                "actionNumber": 10,
                "clock": "PT10M05.00S",
                "period": 1,
                "actionType": "foul",
                "subType": "personal",
                "descriptor": "shooting",
                "personId": 12345,
                "playerName": "Player Name",
                "teamTricode": "GSW",
                "foulPersonalTotal": 1,
                "foulTechnicalTotal": 0,
                "description": "Player Name shooting personal FOUL"
            },
            {
                "actionNumber": 15,
                "clock": "PT08M30.00S",
                "period": 1,
                "actionType": "timeout",
                "subType": "full",
                "teamTricode": "LAL",
                "description": "LAL Timeout"
            }
        ]
    }
}
```

### Common Action Types

| actionType | subType | Description |
|------------|---------|-------------|
| `2pt` | `Layup`, `Dunk`, `Jump Shot`, `Hook` | Two-point field goal |
| `3pt` | `Jump Shot` | Three-point field goal |
| `freethrow` | `1 of 2`, `2 of 2`, `1 of 1` | Free throw |
| `rebound` | `offensive`, `defensive` | Rebound |
| `turnover` | `lost ball`, `bad pass`, `out of bounds` | Turnover |
| `steal` | - | Steal |
| `block` | - | Blocked shot |
| `foul` | `personal`, `shooting`, `offensive` | Foul |
| `timeout` | `full`, `short` | Timeout |
| `substitution` | - | Player substitution |
| `jumpball` | - | Jump ball |
| `period` | `start`, `end` | Period start/end |
| `game` | `end` | Game end |

### Helper Function

```python
from nba_api.live.nba.endpoints import playbyplay

def get_play_by_play(game_id, last_action_number=0):
    """
    Get play-by-play actions, optionally filtered to new plays only.

    Args:
        game_id: The game ID
        last_action_number: Only return actions after this number (for polling)

    Returns:
        List of play actions
    """
    pbp = playbyplay.PlayByPlay(game_id=game_id)
    data = pbp.get_dict()['game']

    actions = []
    for action in data['actions']:
        if action['actionNumber'] <= last_action_number:
            continue

        actions.append({
            'action_number': action['actionNumber'],
            'period': action['period'],
            'clock': parse_game_clock(action.get('clock', '')),
            'type': action.get('actionType', ''),
            'sub_type': action.get('subType', ''),
            'player': action.get('playerNameI', action.get('playerName', '')),
            'team': action.get('teamTricode', ''),
            'description': action.get('description', ''),
            'score_home': int(action.get('scoreHome', 0)),
            'score_away': int(action.get('scoreAway', 0)),
            'is_scoring_play': action.get('isFieldGoal') == 1 or action.get('actionType') == 'freethrow'
        })

    return actions

def get_scoring_plays(game_id):
    """Get only scoring plays from a game."""
    plays = get_play_by_play(game_id)
    return [p for p in plays if p['is_scoring_play']]
```

---

## 4. Live Polling Implementation

Complete example for continuously monitoring a live game.

```python
import time
from nba_api.live.nba.endpoints import scoreboard, boxscore, playbyplay

class NBALiveTracker:
    def __init__(self, poll_interval=10):
        self.poll_interval = poll_interval
        self.last_action_number = 0

    def get_live_game_ids(self):
        """Get IDs of games currently in progress."""
        board = scoreboard.ScoreBoard()
        games = board.get_dict()['scoreboard']['games']
        return [g['gameId'] for g in games if g['gameStatus'] == 2]

    def track_game(self, game_id, callback):
        """
        Track a live game and call callback on each update.

        Args:
            game_id: Game to track
            callback: Function called with (box_score, new_plays) on each poll
        """
        print(f"Tracking game {game_id}...")

        while True:
            try:
                # Get current box score
                box = boxscore.BoxScore(game_id=game_id)
                box_data = box.get_dict()['game']

                # Get new plays since last poll
                pbp = playbyplay.PlayByPlay(game_id=game_id)
                pbp_data = pbp.get_dict()['game']

                new_plays = [
                    a for a in pbp_data['actions']
                    if a['actionNumber'] > self.last_action_number
                ]

                if new_plays:
                    self.last_action_number = new_plays[-1]['actionNumber']

                # Call user callback
                callback(box_data, new_plays)

                # Check if game ended
                if box_data['gameStatus'] == 3:
                    print("Game ended!")
                    break

            except Exception as e:
                print(f"Error: {e}")

            time.sleep(self.poll_interval)

# Usage example
def on_update(box_score, new_plays):
    home = box_score['homeTeam']
    away = box_score['awayTeam']

    print(f"\n{away['teamTricode']} {away['score']} @ {home['teamTricode']} {home['score']}")
    print(f"Q{box_score['period']} - {box_score.get('gameClock', '')}")

    for play in new_plays:
        desc = play.get('description', '')
        if desc:
            print(f"  >> {desc}")

# Run tracker
tracker = NBALiveTracker(poll_interval=10)
live_games = tracker.get_live_game_ids()

if live_games:
    tracker.track_game(live_games[0], on_update)
else:
    print("No live games right now")
```

---

## 5. Game ID Format

NBA game IDs follow this format: `00XYYYYNNNNN`

| Part | Meaning |
|------|---------|
| `00` | Always `00` |
| `X` | Season type: `1`=Preseason, `2`=Regular, `4`=Playoffs |
| `YYYY` | Season year (start year, e.g., `2024` for 2024-25 season) |
| `NNNNN` | Game number (sequential) |

Examples:
- `0022400001` = Regular season 2024-25, game #1
- `0042400101` = Playoffs 2024-25, game #101

---

## 6. Error Handling

```python
from nba_api.live.nba.endpoints import boxscore
from requests.exceptions import RequestException

def safe_get_boxscore(game_id, retries=3):
    """Get box score with retry logic."""
    for attempt in range(retries):
        try:
            box = boxscore.BoxScore(game_id=game_id, timeout=30)
            return box.get_dict()
        except RequestException as e:
            print(f"Request failed (attempt {attempt + 1}/{retries}): {e}")
            if attempt < retries - 1:
                time.sleep(2 ** attempt)  # Exponential backoff
    return None
```

---

## 7. Rate Limiting Best Practices

The NBA.com CDN doesn't have documented rate limits, but follow these guidelines:

1. **Poll every 10-15 seconds** - Data doesn't update faster than this anyway
2. **Use single requests** - Don't hammer the API with parallel requests
3. **Cache when possible** - Store game IDs, don't re-fetch scoreboard constantly
4. **Handle errors gracefully** - Back off on errors, don't retry immediately

```python
import time

class RateLimiter:
    def __init__(self, min_interval=10):
        self.min_interval = min_interval
        self.last_request = 0

    def wait(self):
        elapsed = time.time() - self.last_request
        if elapsed < self.min_interval:
            time.sleep(self.min_interval - elapsed)
        self.last_request = time.time()

# Usage
limiter = RateLimiter(min_interval=10)

while True:
    limiter.wait()
    # Make API call
    data = get_live_games()
```

---

## Quick Reference

| Endpoint | Import | Key Method |
|----------|--------|------------|
| Today's games | `from nba_api.live.nba.endpoints import scoreboard` | `ScoreBoard().get_dict()` |
| Box score | `from nba_api.live.nba.endpoints import boxscore` | `BoxScore(game_id).get_dict()` |
| Play-by-play | `from nba_api.live.nba.endpoints import playbyplay` | `PlayByPlay(game_id).get_dict()` |

## Data Source

All data comes from: `https://cdn.nba.com/static/json/liveData/`

- Scoreboard: `/scoreboard/todaysScoreboard_00.json`
- Box score: `/boxscore/boxscore_{game_id}.json`
- Play-by-play: `/playbyplay/playbyplay_{game_id}.json`
