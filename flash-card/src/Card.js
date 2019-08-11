import React from 'react';
import Card, { CardHeader, CardMedia, CardContent, CardActions } from 'material-ui/Card';
import Collapse from 'material-ui/transitions/Collapse';
import Avatar from 'material-ui/Avatar';
import IconButton from 'material-ui/IconButton';
import Typography from 'material-ui/Typography';
import FavoriteIcon from 'material-ui-icons/Favorite';
import ShareIcon from 'material-ui-icons/Share';
import ExpandMoreIcon from 'material-ui-icons/ExpandMore';

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

const FlashCard = ({
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
}) => <Card>
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
  
  <CardActions disableActionSpacing>
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
</Card>;

export default FlashCard;
