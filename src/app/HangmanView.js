// @flow
import React, {Component} from 'react';
import HintInput from './HintInput';
import words from '../data/words.json';
import {Dictionary, parseStringAsHint} from './Dictionary';
import AlphabetView from './AlphabetView';
import SolutionView from './SolutionView';
import {Header,Segment,Progress, Modal} from 'semantic-ui-react';

import styles from './HangmanView.css'

type State = {
    hintInput: string,
    duds: Set<string>,
    progress: number,
    boundingRect: {
        width: number,
        height: number,
        top: number,
        left: number}
};

export default class extends Component<{}, State> {
    dictionary: Dictionary;
    constructor() {
        super();
        this.dictionary = new Dictionary();
        this.state = {
            hintInput: '',
            boundingRect:{
                width: 0,
                height: 0,
                top: 0,
                left: 0
            },
            duds: new Set(),
            progress: 0};
    }

    componentDidMount() {
        this.dictionary.add(words.data, this.setProgress);
        this.setState({boundingRect: this.hintRef.getBoundingClientRect()});
    }

    setHint = value => this.setState({hintInput: value});
    setDuds = duds => this.setState({duds});
    setProgress = progress => this.setState({progress});
    handleHintRef = (ref) => this.hintRef = ref;
    handleProgressRef = ref => this.progressRef = ref;
    render() {
        const hint = parseStringAsHint(this.state.hintInput);
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
                    <div ref={this.handleHintRef}>
                        <HintInput onChange={this.setHint} />
                    </div>
                    <AlphabetView hint={hint} onChange={this.setDuds}/>
                    <SolutionView solutions={this.dictionary.search(hint, this.state.duds)}
                              limit={20}/>
                    </div>
                </React.Fragment>
        );
    }
}
