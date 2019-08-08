import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { Router, Route, Switch, Redirect } from 'react-router';
import history from './history'

import Game from './components/Game';
import Menu from './components/Menu';
import store from './store';

import './css/game.css';
import './css/menu.css';
import './css/top-bar.css';
import './css/bottom-bar.css';

const menuRouter = (
  <Router history={history}>
    <Switch>
      <Route path='/' exact render={props => <Menu {...props} />} />
    </Switch>
  </Router>
)

const gameRouter = (
  <Router history={history}>
    <Switch>
      <Route path='/:gameName' exact render={props => <Game {...props} />} />
      <Route path='/:gameName/' render={() => <Redirect to="/" />} />
    </Switch>
  </Router>
)

  ReactDOM.render(menuRouter, document.getElementById('menu'));
  ReactDOM.render(<Provider store={store}>{gameRouter}</Provider>, document.getElementById('game'));