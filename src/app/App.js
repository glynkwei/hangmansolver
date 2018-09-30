// @flow
import React, { Component } from 'react';
import './App.css';
import ContainerView from './invert/ContainerView';
import type {Rectangle} from './invert/types';


type State = {|
  rectangles: Rectangle[],
|};

class App extends Component<{}, State> {
  state = {rectangles: [{top: 20, left: 20, width: 30, height: 40}, {top: 30, left: 80, width: 30, height: 20}, {top: 101, left: 72, width: 41, height: 69}]};
  render() {
    return (
        <ContainerView/>
    );
  }
}

export default App;
