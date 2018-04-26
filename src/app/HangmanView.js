// @flow
import React, {Component} from 'react';
import HintInput from './HintInput';
import words from '../data/words.json';
import {Dictionary, parseStringAsHint} from './Dictionary';
import AlphabetView from './AlphabetView';
import SolutionView from './SolutionView';
import {Header,Segment} from 'semantic-ui-react';

import styles from './HangmanView.css'

type State = {hintInput: string};

/* eslint-disable react/no-multi-comp */
/* Heads up! HomepageHeading uses inline styling, however it's not the best practice. Use CSS or styled components for
 * such things.
 */




export default class extends Component<{}, State> {
    dictionary: Dictionary;
    constructor() {
        super();
        this.dictionary = new Dictionary(words.data);
        this.state = {hintInput: '', duds: new Set()};
    }

    setHint = value => this.setState({hintInput: value});
    setDuds = duds => this.setState({duds});

    render() {
        const hint = parseStringAsHint(this.state.hintInput);
        return (
                <React.Fragment>
                    <Segment inverted textAlign='center' className='segment' vertical>
                        <Header
                            as='h1'
                            content='Hangman Solver'
                            inverted
                            className='title'
                        />
                    </Segment>
                    <div className ='container'>
                    <HintInput onChange={this.setHint}/>
                    <AlphabetView hint={hint} onChange={this.setDuds}/>
                    <SolutionView solutions={this.dictionary.search(hint, this.state.duds)}
                              limit={20}/>
                    </div>
                </React.Fragment>
        );
    }
}
