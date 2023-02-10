import React from 'react';
import ReactDOM from 'react-dom/client';
import PlayBack from './playback';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <PlayBack motionURL={'./model/Ronnie.glb'} motionType={'glb'} videoURL={'./video/Dance_.mp4'}/>
);

