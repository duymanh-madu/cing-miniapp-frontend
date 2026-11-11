import React from 'react';
import PlazaLoadingV11 from './PlazaLoadingV11.jsx';
export default class PlazaLazyBoundaryV26 extends React.Component {
 state={failed:false};
 static getDerivedStateFromError(){return {failed:true};}
 componentDidCatch(){}
 render(){return this.state.failed?(this.props.fallback||<PlazaLoadingV11 error onRetry={()=>window.location.reload()} onClose={this.props.onClose} diagnostic={{version:26,stage:'scene',code:'PLAZA_SCENE_UNAVAILABLE'}}/>):this.props.children;}
}
