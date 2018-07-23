const express = require('express');
const bodyParser = require('body-parser');
const socket = require('socket.io');
const fs = require('fs');

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
  hardMode: false
};

// Body Parser allows reading of JSON from POST and/or URL parameters
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

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
    games.push(game);
    writeGamesToFile(games);
  }
  
  res.json(game); // Shouldn't emit game state every time someone loads
});

apiRoutes.post('/:gameName/newGame', (req, res) => {

  res.sendStatus(200);

  const gameName = req.params.gameName;
  const cardSets = req.body.expansions;

  let games = readGamesFromFile();

  let game = Object.assign({}, newGame(cardSets), {gameName: gameName})

  let gameFromStorage = games.find(existingGame => existingGame.gameName == game.gameName);  
  
  if(gameFromStorage)
  {
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

  let games = readGamesFromFile();

  let game = games.find(existingGame => existingGame.gameName == gameName);

  if(game)
  {
    let card = game.cards[cardIndex];
    
    // Don't click the card if already clicked or game is over
    if(game.winner || card.clicked)
    {
      return;
    }

    card.clicked = true;
    card.teamClicked = teamClicked
    
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

    io.to(gameName).emit('updateGame', game);
    writeGamesToFile(games);
  }
});

apiRoutes.get('/:gameName/endTurn', (req, res) => {
  
  res.sendStatus(200);
  
  const gameName = req.params.gameName;

  let games = readGamesFromFile();
  
  let game = games.find(existingGame => existingGame.gameName == gameName);
  
  if(game)
  {
    game.blueTurn = !game.blueTurn;
    io.to(gameName).emit('updateGame', game);
    writeGamesToFile(games);
  }
});

apiRoutes.get('/:gameName/hardMode', (req, res) => {
  
  res.sendStatus(200);
  
  const gameName = req.params.gameName;

  let games = readGamesFromFile();
  
  let game = games.find(existingGame => existingGame.gameName == gameName);
  
  if(game)
  {
    game.hardMode = !game.hardMode;
    io.to(gameName).emit('updateGame', game);
    writeGamesToFile(games);
  }
});

/* Helper functions */
// Determines winner
function calculateCardsRemaining(cards)
{
  let cardCount = {
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
    });
  }
  
  // Set cards to be red/blue/assassin
  
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
  
  
  cards = shuffle(cards);
  
  const blueTurn = blueCards > redCards;
  
  return Object.assign({}, defaultGameState, {cards, blueCards, redCards, blueTurn, blueTeamFirst: (blueCards > redCards)});
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