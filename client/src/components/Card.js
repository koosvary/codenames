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

  return (
    <div className={"card" + cssClass} onClick={props.onClick}>
      {props.info.value}
    </div>
  );
}