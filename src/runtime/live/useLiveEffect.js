import {useEffect, useRef, useState} from 'react';
import {subscribeLiveData} from './appLiveData';
// An existing read effect gets a refresh generation, without remounting the page.
// Its original cleanup still fences cancelled/obsolete requests.
export function useLiveEffect(effect, dependencies = [], domains = ['*']) {
  const [revision, setRevision] = useState(0);
  const previous = useRef(null);
  const key = domains.join('|');
  useEffect(() => {
    let timer;
    const off = subscribeLiveData(key.split('|'), () => {
      if (timer) return;
      timer = setTimeout(() => {timer=null;setRevision(value=>value+1);},150);
    });
    return () => {off();clearTimeout(timer);};
  }, [key]);
  useEffect(() => {
    const background = previous.current !== null && dependencies.length === previous.current.length && dependencies.every((value,index)=>Object.is(value,previous.current[index]));
    previous.current = dependencies;
    const controller=new AbortController();
    const cleanup=effect({background,signal:controller.signal});
    return()=>{controller.abort();if(typeof cleanup === "function")cleanup();};
  }, [...dependencies, revision]);
}
