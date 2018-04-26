// @flow
import React, {Component} from 'react';
import type {Letter, Hint} from 'Dictionary';
import {Label,Icon} from 'semantic-ui-react';
import styles from './AlphabetView.css';

type Props = {hint: Hint, onChange: Set<Letter> => void}
type State = {  toggled: Map<Letter, boolean>}



const letters = ['a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z'];
export default class extends Component<Props, State> {
    constructor(props : Props) {
        super(props);
        const toggled = new Map(letters.map(letter => [letter, true]));
        props.hint.forEach(letter => letter !== '_' && toggled.set(letter, false));
        this.state={toggled};
    }

    shouldComponentUpdate(nextProps, nextState) {
        return nextProps.hint !== this.props.hint ||
            nextState.toggled !== this.state.toggled;
    }

    componentWillReceiveProps(nextProps) {
        if (JSON.stringify(nextProps.hint) !== JSON.stringify(this.props.hint)) {
            const toggled = new Map(letters.map(letter => [letter, true]));
            nextProps.hint.forEach(letter => letter !== '_' && toggled.set(letter, false));
            this.setState({toggled});
        }
    }

    toggle = event => {
      const letter = event.target.dataset.letter;
      const isToggled = this.state.toggled.get(letter);
      const toggled = new Map([...this.state.toggled]);
      toggled.set(letter, !isToggled);
        const duds =new Set([...toggled.entries()]
            .filter(entry => !entry[1])
            .map(entry => entry[0])
            .filter(letter => !this.props.hint.includes(letter)));
      this.setState({toggled}, () => this.props.onChange(duds));
    };
    render() {
        return <div className="alphabetContainer">
            {[...this.state.toggled.entries()].map(entry =>
            {
                const classes = ['letterholder'];
                const isDisabled = this.props.hint.includes(entry[0]);
                if (entry[1]) {
                    classes.push('toggledOn');
                }
                else {
                    classes.push('toggledOff');
                }
                if (isDisabled)
                {
                    classes.push('disabledLetter');
                }
                return <Label
                    data-letter={entry[0]}
                    key={entry[0]}
                    size = 'mini'
                    onClick={isDisabled ? undefined: this.toggle}
                    className = {classes.join(' ')}
                >
                    {entry[0]}
                </Label>
            }, this)}
        </div>
    }
}