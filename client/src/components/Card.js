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
  if(props.info.duet.teamOneValue === 'Agent')
  {
    cssClass += ' team-one-agent';
  }
  else if(props.info.duet.teamOneValue === 'Assassin')
  {
    cssClass += ' team-one-assassin';
  }
  else
  {
    cssClass += ' team-one-neutral';
  }

  // Player Two
  if(props.info.duet.teamTwoValue === 'Agent')
  {
    cssClass += ' team-two-agent';
  }
  else if(props.info.duet.teamTwoValue === 'Assassin')
  {
    cssClass += ' team-two-assassin';
  }
  else
  {
    cssClass += ' team-two-neutral';
  }

  if(props.info.duet.teamOneClicked)
  {
    if(props.info.duet.teamTwoValue === 'Agent')
    {
      cssClass += ' reveal-agent';
    }
    else if(props.info.duet.teamTwoValue === 'Assassin')
    {
      cssClass += ' reveal-assassin';
    }
    else
    {
      cssClass += ' reveal-neutral';
    }
  }
  
  // Also check team two's click as it may overwrite the other team's click
  if(props.info.duet.teamTwoClicked)
  {
    if(props.info.duet.teamOneValue === 'Agent')
    {
      cssClass += ' reveal-agent';
    }
    else if(props.info.duet.teamOneValue === 'Assassin')
    {
      cssClass += ' reveal-assassin';
    }
    else
    {
      cssClass += ' reveal-neutral';
    }
  }


  return (
    <div className={"card" + cssClass} onClick={props.onClick}>
      {props.info.value}
    </div>
  );
}