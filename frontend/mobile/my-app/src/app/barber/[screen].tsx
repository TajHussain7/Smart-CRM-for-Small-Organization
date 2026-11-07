import { Redirect, useLocalSearchParams } from 'expo-router';
import BarberScreen from '../../components/barber-screen';
export default function BarberRoute() {
  const { screen, clientId } = useLocalSearchParams<{ screen: string; clientId?: string }>();
  if(screen==='dashboard')return <Redirect href='/school-dashboard'/>;
  if(screen==='reports')return <Redirect href='/reports'/>;
  if(screen==='alerts')return <Redirect href='/alerts'/>;
  return <BarberScreen key={`${screen}-${clientId}`} page={screen} clientId={clientId} />;
}
