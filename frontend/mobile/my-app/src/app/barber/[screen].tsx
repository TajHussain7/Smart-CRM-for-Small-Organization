import { useLocalSearchParams } from 'expo-router';
import Workspace from '../../live/Workspace';
export default function Screen(){const {screen,clientId}=useLocalSearchParams<{screen:string;clientId?:string}>();return <Workspace screen={`barber-${screen}`} detailId={clientId}/>;}
