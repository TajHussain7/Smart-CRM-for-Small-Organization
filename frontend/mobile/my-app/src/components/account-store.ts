import { useSyncExternalStore } from 'react';
export type Account = {name:string;email:string;phone:string;address:string;bio:string;photo:string};
let account:Account={name:'School Admin',email:'',phone:'',address:'',bio:'',photo:''};
const listeners=new Set<()=>void>();
const subscribe=(fn:()=>void)=>{listeners.add(fn);return()=>{listeners.delete(fn);};};
export const getAccount=()=>account;
export const useAccount=()=>useSyncExternalStore(subscribe,getAccount,getAccount);
export function saveAccount(input:Account){
 if(!input.name.trim())return 'Name is required.';
 if(input.email&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email.trim()))return 'Enter a valid email.';
 account={...input,name:input.name.trim(),email:input.email.trim()};listeners.forEach(fn=>fn());return '';
}
export function clearAccount(){account={name:'School Admin',email:'',phone:'',address:'',bio:'',photo:''};listeners.forEach(fn=>fn());}
