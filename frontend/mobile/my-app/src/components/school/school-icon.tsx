import { Ionicons } from '@expo/vector-icons';

const icons: Record<string, keyof typeof Ionicons.glyphMap> = {
  menu:'menu', students:'school-outline', people:'people-outline', money:'cash-outline',
  fees:'wallet-outline', reports:'bar-chart-outline', calendar:'calendar-outline',
  book:'book-outline', flask:'flask-outline', history:'time-outline',
  dashboard:'grid-outline', tasks:'checkbox-outline', alerts:'notifications-outline',
  profile:'person-outline', plus:'add', close:'close', gym:'barbell-outline', barber:'cut-outline',
  renewal:'refresh-outline', edit:'create-outline', phone:'call-outline', mail:'mail-outline',
  download:'download-outline', back:'arrow-back', search:'search', filter:'filter',
  trend:'trending-up', addPerson:'person-add-outline',
};
export default function SchoolIcon({name,color='#0050d5',size=22}:{name:string;color?:string;size?:number}) {
  return <Ionicons name={icons[name] ?? 'ellipse-outline'} color={color} size={size} accessible={false}/>;
}
