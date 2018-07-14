import React, { Component } from 'react';
import Card from './Card';

class Board extends Component
{
  renderCard(i)
  {
    if(this.props.cards[i])
    {
      return(
        <Card
          info={this.props.cards[i]}
          onClick={() => this.props.cardClick(i)}
        />
      );
    }
  }

  cardClick(i)
  {
    console.log('card' + i +'clcicks')
  }

  render()
  {
    return (
      <div>
        <div className="board-row">
          {this.renderCard(0)}
          {this.renderCard(1)}
          {this.renderCard(2)}
          {this.renderCard(3)}
          {this.renderCard(4)}
        </div>
        <div className="board-row">
          {this.renderCard(5)}
          {this.renderCard(6)}
          {this.renderCard(7)}
          {this.renderCard(8)}
          {this.renderCard(9)}
        </div>
        <div className="board-row">
          {this.renderCard(10)}
          {this.renderCard(11)}
          {this.renderCard(12)}
          {this.renderCard(13)}
          {this.renderCard(14)}
        </div>
        <div className="board-row">
          {this.renderCard(15)}
          {this.renderCard(16)}
          {this.renderCard(17)}
          {this.renderCard(18)}
          {this.renderCard(19)}
        </div>
        <div className="board-row">
          {this.renderCard(20)}
          {this.renderCard(21)}
          {this.renderCard(22)}
          {this.renderCard(23)}
          {this.renderCard(24)}
        </div>
      </div>
    );
  }
}


export default Board;
