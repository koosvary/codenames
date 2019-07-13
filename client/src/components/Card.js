import React from 'react';

export default function Card(props)
{
  let cssClass = '';

  if(props.info.team === 'Blue')
  {
    cssClass += ' blue';
  }
  else if(props.info.team === 'Red')
  {
    cssClass += ' red';
  }
  else if(props.info.team === 'Assassin')
  {
    cssClass += ' black';
  }
  else
  {
    cssClass += ' neutral';
  }
  
  cssClass += (props.info.clicked ? ' revealed' : ' hidden');

  // Duet
  // Player One
  if(props.info.duet.teamOne === 'Agent')
  {
    cssClass += ' team-one-agent';
  }
  else if(props.info.duet.teamOne === 'Assassin')
  {
    cssClass += ' team-one-assassin';
  }
  else
  {
    cssClass += ' team-one-neutral';
  }

  // Player Two
  if(props.info.duet.teamTwo === 'Agent')
  {
    cssClass += ' team-two-agent';
  }
  else if(props.info.duet.teamTwo === 'Assassin')
  {
    cssClass += ' team-two-assassin';
  }
  else
  {
    cssClass += ' team-two-neutral';
  }

  // True card value
  if(props.info.duet.trueValue === 'Agent')
  {
    cssClass += ' true-value-agent';
  }
  else if(props.info.duet.trueValue === 'Assassin')
  {
    cssClass += ' true-value-assassin';
  }
  else
  {
    cssClass += ' true-value-neutral';
  }

  cssClass += (props.info.duet.clicked ? ' duet-revealed' : ' duet-hidden');

  return (
    <div className={"card" + cssClass} onClick={props.onClick}>
      {props.info.value}
    </div>
  );
}