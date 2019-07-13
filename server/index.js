const express = require('express');
const bodyParser = require('body-parser');
const socket = require('socket.io');
const fs = require('fs');
const time = require('express-timestamp');
const moment = require('moment');
var schedule = require('node-schedule');

const wordList = require('./models/cards');

const app = express();

const PORT = 5000;

const defaultGameState = {
  cards: [],
  gameName: null,
  blueTurn: false,
  redCards: 0,
  blueCards: 0,
  winner: null,
  blueTeamFirst: false,
  hardMode: false,
  duet: {
    winner: null,
    cardsLeft: 15,
  }
};

// Body Parser allows reading of JSON from POST and/or URL parameters
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

// Use the request timestamp library
app.use(time.init);

// Route to /api
var apiRoutes = express.Router();
app.use('/api', apiRoutes);

const server = app.listen(PORT, 'localhost', () => console.log(`Codenames server listening on port ${PORT}`));

const io = socket(server);

io.on('connection', socket => {  
  socket.on('joinRoom', (roomName) => {
    socket.join(roomName);
  })

  socket.on('disconnect', () => {});
})

apiRoutes.get('/:gameName', (req, res) => {

  const gameName = req.params.gameName;

  let games = readGamesFromFile();
  
  let game = games.find(game => game.gameName == gameName);

  if(!game)
  {
    game = newGame();
    game.gameName = gameName;
    game.gameStartTime = req.timestamp;
    game.lastUpdated = req.timestamp;

    games.push(game);
    writeGamesToFile(games);
  }
  
  res.json(game); // Shouldn't emit game state every time someone loads
});

apiRoutes.post('/:gameName/newGame', (req, res) => {

  res.sendStatus(200);

  const gameName = req.params.gameName;
  const cardSets = req.body.expansions;

  const games = readGamesFromFile();

  let game = Object.assign({}, newGame(cardSets), {gameName})

  const gameFromStorage = games.find(existingGame => existingGame.gameName == game.gameName);  
  
  if(gameFromStorage)
  {
    if(!requestIsNew(gameFromStorage.lastUpdated, req.timestamp)) return;
  
    // Timestamp the game
    game.gameStartTime = req.timestamp;
    game.lastUpdated = req.timestamp;
    
    // Update existing game
    game = Object.assign(gameFromStorage, game, {hardMode: gameFromStorage.hardMode});
  }
  else
  {
    games.push(game);
  }
  
  io.to(gameName).emit('updateGame', game);
  writeGamesToFile(games);
});

apiRoutes.post('/:gameName/cardClicked', (req, res) => {

  res.sendStatus(200);
  
  const gameName = req.params.gameName;
  const cardIndex = req.body.cardIndex;
  const teamClicked = req.body.teamClicked;

  const games = readGamesFromFile();

  const game = games.find(existingGame => existingGame.gameName == gameName);

  if(game)
  {
    if(!requestIsNew(game.lastUpdated, req.timestamp)) return;

    let card = game.cards[cardIndex];
    
    // Click the card for the standard game mode
    // Don't click the card if already clicked or game is over
    if(!(game.winner || card.clicked))
    {
      card.clicked = true;    
      card.teamClicked = teamClicked;
      
      const cardsRemaining = calculateCardsRemaining(game.cards);
  
      game.redCards = cardsRemaining.redTeam;
      game.blueCards = cardsRemaining.blueTeam;
  
      game.winner = determineWinner(game.cards);
  
      // End turn if not the team's card
      if(game.blueTurn && card.team != "Blue" ||
        !game.blueTurn && card.team != "Red")
      {
        game.blueTurn = !game.blueTurn;
      }
    }

    // Click the card for the duet game mode
    if(!(game.duet.winner || card.duet.clicked))
    {
      card.duet.clicked = true;
      
      game.duet.cardsLeft = calculateCardsRemainingDuet(game.cards);
  
      game.duet.winner = determineWinnerDuet(game.cards);
    }

    io.to(gameName).emit('updateGame', game);
    writeGamesToFile(games);
  }
});

apiRoutes.get('/:gameName/endTurn', (req, res) => {
  
  res.sendStatus(200);
  
  const gameName = req.params.gameName;

  const games = readGamesFromFile();
  
  const game = games.find(existingGame => existingGame.gameName == gameName);
  
  if(game)
  {
    if(!requestIsNew(game.lastUpdated, req.timestamp)) return;

    game.blueTurn = !game.blueTurn;
    io.to(gameName).emit('updateGame', game);
    writeGamesToFile(games);
  }
});

apiRoutes.get('/:gameName/hardMode', (req, res) => {
  
  res.sendStatus(200);
  
  const gameName = req.params.gameName;

  const games = readGamesFromFile();
  
  const game = games.find(existingGame => existingGame.gameName == gameName);
  
  if(game)
  {
    if(!requestIsNew(game.lastUpdated, req.timestamp)) return;
    
    game.hardMode = !game.hardMode;
    io.to(gameName).emit('updateGame', game);
    writeGamesToFile(games);
  }
});

/* Helper functions */
// Determines winner
function calculateCardsRemaining(cards)
{
  const cardCount = {
    blueTeam: 0,
    redTeam: 0
  }
  
  if(cards.length)
  {
    const blueCardsRemaining = cards.filter(card => card.team === 'Blue' && !card.clicked);
    cardCount.blueTeam = blueCardsRemaining.length;
    
    const redCardsRemaining = cards.filter(card => card.team === 'Red' && !card.clicked);
    cardCount.redTeam = redCardsRemaining.length;
  }
  
  return cardCount;
}

function calculateCardsRemainingDuet(cards)
{
  if(cards.length)
  {
    const duetCardsRemaining = cards.filter(card => (card.duet.teamOne === 'Agent' || card.duet.teamTwo === 'Agent') && !card.clicked);
    return duetCardsRemaining.length;
  }
  
  return null;
}

function determineWinner(cards)
{
  if (cards.length)
  {
    const assassinCard = cards.find(card => card.team === 'Assassin' && card.clicked);
    
    if (assassinCard)
    {
      if (assassinCard.teamClicked === 'Red')
      {
        return 'Blue';
      }
      else
      {
        return 'Red';
      }
    }
    
    const cardsRemaining = calculateCardsRemaining(cards);
    
    if (cardsRemaining.blueTeam === 0)
    {
      return 'Blue';
    }
    
    if (cardsRemaining.redTeam === 0)
    {
      return 'Red';
    }
  }
  
  return null;
}

function determineWinnerDuet(cards)
{
  if (cards.length)
  {
    // Theres three assassins, but we only need to know find one that was clicked
    // The assassins exist only if the other member doesn't see an agent (because they're agents)
    const assassinCard = cards.find(card => ((card.duet.teamOne === 'Assassin' && card.duet.teamTwo !== 'Agent')
                                            || (card.duet.teamOne !== 'Agent' && card.duet.teamTwo === 'Assassin'))
                                            && card.clicked);
    
    if(assassinCard)
    {
      return 'Lose';
    }
    
    const cardsRemaining = calculateCardsRemainingDuet(cards);
    
    if(cardsRemaining === 0)
    {
      return 'Win';
    }
  }
  
  return null;
}

// Creates a new game
function newGame(cardSets = ['VANILLA'])
{
  // cardSets = Array.from(new Set(cardSets));
  cardSets = Array.from(new Set(cardSets));
  
  // Find out which sets are to be used (cardSets)
  // Get all the cards and randomize the order
  let words = [];
  
  for (let i = 0; i < cardSets.length; i++)
  {
    switch (cardSets[i])
    {
      case 'VANILLA':
      {
        words.push(...wordList.vanilla);
        break;
      }
      case 'DUET':
      {
        words.push(...wordList.duet);
        break;
      }
      case 'UNDERCOVER':
      {
        words.push(...wordList.deep_undercover);
        break;
      }
      default:
      {
        break;
      }
    }
  }
  
  // If word list is empty, default to vanilla set
  if (!words.length)
  {
    words.push(...wordList.vanilla);
  }
  
  words = shuffle(words);
  
  let blueCards = 8;
  let redCards = 8;
  
  const blueGoesFirst = Math.floor(Math.random() * 2); // Binary RNG
  if (blueGoesFirst)
  {
    blueCards++;
  }
  else
  {
    redCards++;
  }
  
  let cards = [];
  // Fill with the first 25 cards
  for (let i = 0; i < 25; i++)
  {
    cards.push({
      value: words[i],
      team: 'Neutral',
      clicked: false,
      teamClicked: null,
      duet: {
        clicked: null,
        teamOne: 'Neutral',
        teamTwo: 'Neutral',
      }
    });
  }
  
  cards = assignTeamsToCards(cards, blueCards, redCards);
  cards = assignTeamsToCardsDuet(cards);
  
  const blueTurn = blueCards > redCards;
  
  return Object.assign({}, defaultGameState, {cards, blueCards, redCards, blueTurn, blueTeamFirst: (blueCards > redCards)});
}

// Set cards to be red/blue/assassin
function assignTeamsToCards(cards, blueCards, redCards)
{
  // Blue cards at start of deck
  for (let i = 0; i < blueCards; i++)
  {
    cards[i].team = 'Blue';
  }
  
  // Red cards after blue cards
  for (let i = blueCards; i < (blueCards + redCards); i++)
  {
    cards[i].team = 'Red';
  }
  
  // Assassin after the other cards
  cards[17].team = 'Assassin';
  
  return shuffle(cards);
}

// Set cards to be red/blue/assassin
function assignTeamsToCardsDuet(cards)
{
  // Assign cards based for both teams
  for (let i = 0; i < 25; i++)
  {
    // Team One
    // Assassins
    if(i == 0 || i == 16 || i == 24)
    {
      cards[i].duet.teamOne = 'Assassin';
    }

    // Agents
    if(i >= 6 && i <= 14)
    {
      cards[i].duet.teamOne = 'Agent';
    }

    // Team Two
    // Assassins
    if(i >= 14 && i <= 16)
    {
      cards[i].duet.teamTwo = 'Assassin';
    }

    // Agents
    if(i >= 0 && i <= 8)
    {
      cards[i].duet.teamOne = 'Agent';
    }
  }
  
  return shuffle(cards);
}

// Randomly shuffles an array
function shuffle(array)
{
  for (let i = array.length - 1; i > 0; i -= 1)
  {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = array[i];
    array[i] = array[j];
    array[j] = temp;
  }
  
  return array;
}

// Tests to see if the request time is newer than the game's lastUpdated time
function requestIsNew(gameTime, requestTime)
{
  // Both times *should* be in a momentjs readable format
  if(moment(requestTime).isAfter(moment(gameTime)))
  {
    return true;
  }
  return false;
}

function logError(err) {
  console.log(err)
}

function readGamesFromFile()
{
  const gamesFile = fs.readFileSync(__dirname + '/models/games.json');
  return games = JSON.parse(gamesFile);
}

function writeGamesToFile(games)
{
  fs.writeFileSync(__dirname + '/models/games.json', JSON.stringify(games, null, 2), err => logError(err));
}

/* Scheduled functions */

// Checks games every hour for games older than 12 hours, deletes them
// Sets the rule to search on every 0 minute (start of every hour)
var rule = new schedule.RecurrenceRule();
rule.minute = 0;

schedule.scheduleJob(rule, function(){  
  const games = readGamesFromFile();

  // Filter out any games updated more than 12 hours ago
  const trimmedGames = games.filter(game => moment(game.lastUpdated).isAfter(moment().subtract(12, 'hours')));

  writeGamesToFile(trimmedGames);
});