import { useLocalSearchParams } from 'expo-router';
import Workspace from '../../live/Workspace';
export default function Screen(){const {id}=useLocalSearchParams<{id:string}>();return <Workspace screen="students" detailId={id}/>;}
