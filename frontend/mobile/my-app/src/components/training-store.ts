import { useSyncExternalStore } from 'react';
export type Training={id:string;studentId:string;student:string;trainer:string;date:string;time:string;type:string};
let sessions:Training[]=[];
const listeners=new Set<()=>void>();
const subscribe=(fn:()=>void)=>{listeners.add(fn);return()=>{listeners.delete(fn);};};
export const getTraining=()=>sessions;
export const useTraining=()=>useSyncExternalStore(subscribe,getTraining,getTraining);
export function recordTraining(item:Training){if(!sessions.some(s=>s.id===item.id)){sessions=[...sessions,item];listeners.forEach(fn=>fn());}}
