// @flow
import React, {Component} from 'react';
import HintInput from './HintInput';
import words from '../data/words.json';
import commonWords from '../data/commonwords.json';
import {Dictionary, parseStringAsHint} from './Dictionary';
import AlphabetView from './AlphabetView';
import SolutionView from './SolutionView';
import {Header,Segment, Button, Progress, Modal} from 'semantic-ui-react';

import styles from './HangmanView.css'

type State = {
    hintInput: string,
    duds: Set<string>,
    progress: number,
    displayLoadMoreCTA: boolean
};

export default class extends Component<{}, State> {
    dictionary: Dictionary;
    constructor() {
        super();
        this.dictionary = new Dictionary();
        this.state = {
            hintInput: '',
            duds: new Set(),
            progress: 0,
            displayLoadMoreCTA: true
        };
    }

    componentDidMount() {
        this.dictionary.add(commonWords.data, this.onProgressLoadingCommonWords);
    }

    setHint = value => this.setState({hintInput: value});
    setDuds = duds => this.setState({duds});
    loadMoreWords = () => this.dictionary.add(words.data, this.onProgressLoadingAllWords);
    onProgressLoadingCommonWords = progress => this.setState({progress});
    onProgressLoadingAllWords = progress => {
      this.setState({progress}, () => {
          if (this.state.progress >= 100) {
            this.setState({displayLoadMoreCTA: false});
          }
      });

    };

    render() {
        const hint = parseStringAsHint(this.state.hintInput);
        const solutions = this.dictionary.search(hint, this.state.duds);
        return (
                <React.Fragment>
                    {this.state.progress < 100 &&
                        <Modal defaultOpen closeOnDimmerClick={false}>
                            <Modal.Content>
                            <Progress value={this.state.progress} total={100} indicating precision={0} progress='percent'>
                                Loading data...
                            </Progress>
                            </Modal.Content>
                        </Modal>
                    }
                    <Segment inverted textAlign='center' className='segment' vertical>
                        <Header
                            as='h1'
                            content='Hangman Solver'
                            inverted
                            className='title'
                        />
                    </Segment>
                    <div className ='container'>
                        <HintInput onChange={this.setHint} />
                        <AlphabetView hint={hint} onChange={this.setDuds}/>
                        <SolutionView
                            solutions={solutions}
                            displayLoadMoreCTA={this.state.displayLoadMoreCTA}
                            onClick={this.loadMoreWords}
                                  limit={20}/>
                    </div>
                </React.Fragment>
        );
    }
}
