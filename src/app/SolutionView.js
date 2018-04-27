// @flow
import React, {Component} from 'react';
import FlipMove from 'react-flip-move';
import {Label,Icon} from 'semantic-ui-react';
import styles from './SolutionView.css';

type Props = { solutions: [string], limit: number , displayLoadMoreCTA: boolean}
type State = { viewable: Set<string>, valid: Set<string> }

const shuffle = (array: Array<any>) => {
    let j, x, i;
    for (i = array.length - 1; i > 0; i--) {
        j = Math.floor(Math.random() * (i + 1));
        x = array[i];
        array[i] = array[j];
        array[j] = x;
    }
    return array;
};


export default class extends Component<State, Props> {
    constructor(props: Props) {
        super(props);
        const valid = new Set(shuffle(props.solutions));
        const viewable = new Set([...valid.entries()].slice(0, props.limit).map(entry => entry[0]));
        this.state = {viewable, valid};

    }

    shouldComponentUpdate(nextProps, nextState) {
        return nextProps.solutions !== this.props.solutions ||
            nextProps.displayLoadMoreCTA !== this.props.displayLoadMoreCTA ||
            nextProps.limit !== this.props.limit ||
            nextState.viewable !== this.state.viewable ||
            nextState.valid !== this.state.valid;
    }

    static getDerivedStateFromProps(nextProps) {
        const valid = new Set(shuffle(nextProps.solutions));
        const viewable = new Set([...valid.values()].slice(0, nextProps.limit));
        return {viewable, valid};
    }

    removeWord = (word: string) => {
        this.setState((prevState) => {
            const valid = new Set([...prevState.valid]);
            valid.delete(word);
            const viewable = new Set([...valid.values()].slice(0, this.props.limit));
            return {viewable, valid};
        });
    };

    render() {
        return (
            <FlipMove
                staggerDurationBy="30"
                duration={500}
                leaveAnimation="none"
            >
                {
                    [...this.state.viewable.values()].map(solution =>
                        <div className="solution" key={solution}>
                            <Label>
                                {solution}
                                <Icon data-solution={solution}
                                      onClick={(event) => this.removeWord(event.target.dataset.solution)} name='close'/>
                            </Label>
                        </div>)
                }
                {this.props.displayLoadMoreCTA &&
                <div className="solution">
                    <Label onClick={this.props.onClick}
                        content ='Load more words'
                        className="cta loadmore"
                        icon="download"/>
                </div>
                    }
            </FlipMove>);
    }

}