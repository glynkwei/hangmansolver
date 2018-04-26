// @flow
import React, {Component} from 'react';
import {Input} from 'semantic-ui-react';
import styles from './HintInput.css';

type Props = { onChange: string => void };
type State = { value: string };
export default class extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            value: ''
        };
    }

    componentDidMount() {
        this.inputRef.inputRef.style['letter-spacing'] = '2px';
    }

    handleChange = (event) => {
        const value = event.target.value.replace(' ', '_').replace(/[^a-zA-Z_]/g, '');
        this.setState({value}, () => this.props.onChange(value));

    };

    handleRef = (inputRef) => {
        this.inputRef = inputRef;
    };

    render() {
        return (
                <div className="hintInputContainer">
                    <Input
                        value={this.state.value}
                        onChange={this.handleChange}
                        placeholder='Search...'
                        className = 'hintInput'
                        fluid
                        iconPosition='left'
                        icon='search'
                        size='massive'
                        ref={this.handleRef}
                    />
                </div>
        );
    }
}
