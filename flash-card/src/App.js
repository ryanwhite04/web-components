import React, { Component } from 'react';
import './App.css';
import data from './decks/elec5501.json';
import * as firebase from 'firebase';

import { default as CardBody, CardHeader, CardMedia, CardContent, CardActions } from 'material-ui/Card';
import Collapse from 'material-ui/transitions/Collapse';
import Avatar from 'material-ui/Avatar';
import IconButton from 'material-ui/IconButton';
import Typography from 'material-ui/Typography';
import FavoriteIcon from 'material-ui-icons/Favorite';
import ShareIcon from 'material-ui-icons/Share';
import ExpandMoreIcon from 'material-ui-icons/ExpandMore';


// Should import
//   Mnemosyne 2.0 .db files
//   Supermemo xml files
//   anki decks
//   google spreadsheets
//   plain text files (utf-8), csv, ssv, tsv
//   all same number of fields
//   html is allowed

// const Expandable = ({
// children, expanded
// }) => {
//   console.log('Expandable', this, {
//     children, expanded,
//   })
//   return <div>
//     <CardActions disableActionSpacing>
//       <IconButton onClick={false}><ExpandMoreIcon /></IconButton>
//     </CardActions>
//     <Collapse in={expanded} transitionDuration="auto" unmountOnExit>
//       {children}
//     </Collapse>
//   </div>
// }

// Default Card fields are
// Tags, Type(View), Deck, Card, FrontSide(Only for back template)
// Wait = time before auto reveal and fail, default is 10 seconds
// Flags, such as edit, mark, hide, bury, star, share

// Type::Name::Hint  inputs
// Hide::Name::Hint  cloze deletions
// Type::Hide::Name::Hint inputs to cloze deletions
// Hint::Name

// Stylings
// fontFamily
// fontSize
// textAlign
// color
// backgroundColor

// Things to style
// Input, Image, Audio, Video
// <input> <img> <audio> <video> <math> <latex>

// If, not if statements

const app = firebase.initializeApp({
  apiKey: "AIzaSyDJWmQ_4jH4kHPJtu00bzuRILPn-C9HObE",
  authDomain: "notes-f0b38.firebaseapp.com",
  databaseURL: "https://notes-f0b38.firebaseio.com",
  projectId: "notes-f0b38",
  storageBucket: "notes-f0b38.appspot.com",
  messagingSenderId: "782690322588"
});

console.log('app', app);

const Deck = ({
  cards, // { tags, type, deck, frontside }
  ordered = true, // {OldestFirst, Random, FailedMost, FIFO, FOFI
}) => {
  return <div>
    {cards}
  </div>;
};

const Card = ({
  score,
  header,
  media = [],
  question,
  solution,
  hint,
  pass,
  fail,
  expanded = false,
  expand = e => {
    let { target, currentTarget } = e;
    e.persist(); console.log(target, currentTarget, this)
  },
}) => {
  let style = {
    front: {

    },
    back: {

    },
  };

  let frontSide = {

  };

  // #fail {
  //   background-color: var(--paper-red-500);
  // }
  // #fail:hover {
  //   background-color: var(--paper-red-100);
  // }
  // #pass {
  //   background-color: var(--paper-green-500);
  //   float: right;
  // }
  // #pass:hover {
  //   background-color: var(--paper-green-100);
  // }
  // paper-icon-button[icon="help"] {
  //   float: right;
  // }

  return <CardBody style={{
    width: "100%",
    userSelect: "none",
    cursor: "default",
    margin: "20px 0",
  }}>
    {header && <CardHeader
      avatar={<Avatar>{score}</Avatar>}
      title={header.title}
      subheader={header.subheader}
    />}
    {media
      .filter(({ type, image, title }) => image && title && type && type === 'image')
      .map(file => <CardMedia {...file} />)}

    <CardContent>
      <Typography component="p">{question}</Typography>
    </CardContent>
    <CardContent>
      <Typography paragraph type="body2">{solution}</Typography>
    </CardContent>

    <CardActions style={{ color: 'white' }} disableActionSpacing>
      <IconButton onClick={expand}><ExpandMoreIcon /></IconButton>
    </CardActions>
    <Collapse in={expanded} transitionDuration="auto" unmountOnExit>
      <CardActions disableActionSpacing>
        <IconButton aria-label="Add to favorites">
          <FavoriteIcon />
        </IconButton>
        <IconButton aria-label="Share">
          <ShareIcon />
        </IconButton>
      </CardActions>
    </Collapse>
  </CardBody>;
}

export default class App extends Component {

  //   static propTypes = {
  //     title: PropTypes.string.isRequired,
  //     price: PropTypes.number.isRequired,
  //     initialQty: PropTypes.number
  // };

  static defaultProps = {
    title: 'Undefined Product',
    price: 100,
    initialQty: 0
  }

  state = {
    something: true,
  }

  expand = e => {
    console.log(e, this);
  }

  render = () => <div className="App">
    <Card
      question={'2^4'}
      solution={16}
    ></Card>
    <Deck cards={data.notes
      .map(([question, solution, hint], key) => ({
        question,
        solution,
        hint,
        key,
        expand: this.expand,
      }))
      .map((note, key) => <Card key={key} {...note} />)
    }>
    </Deck>
  </div>
}
