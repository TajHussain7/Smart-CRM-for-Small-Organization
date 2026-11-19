import { useLocalSearchParams } from 'expo-router';
import Workspace from '../live/Workspace';
export default function Screen(){const {screen}=useLocalSearchParams<{screen?:string}>();return <Workspace screen={screen}/>;}
