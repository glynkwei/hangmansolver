// @flow
import * as React from 'react';
import { Rnd } from 'react-rnd';
import type { Rectangle } from './types';
import { Context } from './invert';


type KeyedRectangle = {|
    ...Rectangle,
    id: number;
|};

type State = {|
    rectangles: KeyedRectangle[],
|};



const styles = ({top, left, width, height} : Rectangle ) => (
    {
        backgroundColor: '#564c4c',
        border: 'solid 1px white',
    }
);

class ContainerView extends React.Component<{}, State>  {


    id: number  = 0;
    state = { rectangles: [], width: 500, height: 500};
    rectangleRefs : {[number] : React.ElementRef<*> } = {};
    createRefs: (id: number) => React.ElementRef<*> = id => {
        const ref = React.createRef();
        this.rectangleRefs[id] = ref;
        return ref;
    };

    ID = () => {
        this.id = this.id + 1;
        return this.id;
    };

    computeRectanglesFromRefs = () => (
        [...Object.values(this.rectangleRefs)]
            .map(({current}) => current)
            .filter(Boolean)
            .map(({resizable}) => resizable)
            .filter(Boolean)
            .map(({resizable}) => resizable)
            .filter(Boolean)
            .map(el => {
            const {top, width, left, height } = el.getBoundingClientRect();
            return {top, left, width, height};
        }));

    computeDimensionsFromRefs = () => {

    };

    createRectangle = () => {
        const fudgeFactor = Math.floor(Math.random() * 10 - 10);
        const id = this.ID();
        const rectangles = this.state.rectangles.concat([{width: 50, height: 50, left: fudgeFactor, top: fudgeFactor, id}]);
        this.setState({rectangles});
    };



    render() {
        const { rectangles, width, height} = this.state;
        return (<React.Fragment>
            <div style={{position: 'relative', width, height , border: 'solid 1px black', resize: 'both'}}>
            {rectangles.map(({id, ...rectangle}) => (
                <Rnd
                    ref={this.createRefs(id)}
                    default={{
                    y: rectangle.top,
                    x: rectangle.left,
                    width: rectangle.width,
                    height: rectangle.height,
                    }}
                    style={styles(rectangle)}
                    key={id}/>
            ))}
        </div>
            <div style={{backgroundColor: '#00a680', color: 'white', textAlign: 'center',  height: 30, width: 100}} onClick={() => {
                const actualRectangles = this.computeRectanglesFromRefs();
                console.log(actualRectangles);
                const context = Context(actualRectangles, this.state.width, this.state.height);
                /**
                const intersections = context.intersects();
                if (intersections.length) {
                    console.log('Intersections detected!');
                }
                 */
                this.setState({rectangles: context.invert().map(rectangle => ({...rectangle, id: this.ID()}))});

            }
            }>
                Invert
            </div>
            <div style={{backgroundColor: '#2aade4', color: 'white', textAlign: 'center',  height: 30, width: 100}} onClick={this.createRectangle}>
                Create
            </div>
        </React.Fragment>);
    }
}

export default ContainerView;