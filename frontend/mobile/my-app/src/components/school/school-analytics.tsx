import { Pressable, StyleSheet, View } from 'react-native';
import { Text } from '../responsive-text';
import Icon from './school-icon';

type RevenueProps = { series: { labels: string[]; values: number[] }; period: 'monthly'|'weekly'; selected: number; onSelect: (index:number)=>void; onPeriod:()=>void };
export function RevenueChart({series,period,selected,onSelect,onPeriod}:RevenueProps) {
  const ceiling = Math.ceil(Math.max(...series.values,1)/5)*5;
  return <View style={s.card}>
    <View style={s.heading}><View style={s.flex}><Text accessibilityRole="header" style={s.title}>Revenue Trend</Text><Text style={s.caption}>{period==='monthly'?'Last 6 months':'This week'} · Sample data</Text></View><Pressable accessibilityRole="button" accessibilityLabel="Change revenue period" onPress={onPeriod} style={s.period}><Text style={s.periodText}>{period==='monthly'?'Monthly':'Weekly'}</Text><Icon name="calendar" size={16}/></Pressable></View>
    <View style={s.summary}><View><Text style={s.caption}>{series.labels[selected]} revenue</Text><Text accessibilityLiveRegion="polite" style={s.amount}>${series.values[selected].toFixed(1)}<Text style={s.unit}>K</Text></Text></View><View style={s.currency}><View style={s.dot}/><Text style={s.caption}>Revenue (USD)</Text></View></View>
    <View style={s.chart}>
      <View style={s.axis}>{[ceiling,ceiling/2,0].map(value=><Text key={value} style={s.axisLabel}>{value===0?'0':`$${value}K`}</Text>)}</View>
      <View style={s.plot}>
        <View pointerEvents="none" style={s.grid}>{[0,1,2].map(value=><View key={value} style={s.gridLine}/>)}</View>
        <View style={s.columns}>{series.values.map((value,index)=><Pressable key={series.labels[index]} accessibilityRole="button" accessibilityLabel={`${series.labels[index]} revenue: ${value} thousand dollars`} accessibilityState={{selected:index===selected}} onPress={()=>onSelect(index)} style={s.column}><View style={s.barSpace}><View style={[s.bar,{height:Math.max(3,value/ceiling*144),backgroundColor:index===selected?'#0755d7':'#b5cdf7'}]}/></View><Text style={[s.month,index===selected&&s.selectedMonth]}>{series.labels[index]}</Text></Pressable>)}</View>
      </View>
    </View>
    <Text style={s.hint}>Tap a bar to view its revenue</Text>
  </View>;
}

export function StudentGrowth() {
  return <View style={s.card}>
    <View style={s.heading}><View style={s.flex}><Text accessibilityRole="header" style={s.title}>Student Growth</Text><Text style={s.caption}>Active enrolments · Sample data</Text></View><View style={s.growthIcon}><Icon name="people" size={24}/></View></View>
    <View style={s.growthSummary}><View><Text style={s.caption}>Total students</Text><Text style={s.amount}>120</Text></View><View style={s.growthBadge}><Icon name="trend" color="#167459" size={18}/><Text style={s.growthPercent}>+12%</Text><Text style={s.target}>Target met</Text></View></View>
    <View accessible accessibilityLabel="120 active students: 24 new, 20 percent; 96 returning, 80 percent" style={s.distribution}><View style={s.newSegment}/><View style={s.returningSegment}/></View>
    <View style={s.breakdown}>{[{label:'New students',value:'24',share:'20%',color:'#0755d7'},{label:'Returning',value:'96',share:'80%',color:'#9dbdf1'}].map(item=><View key={item.label} style={s.breakdownCard}><View style={s.legend}><View style={[s.dot,{backgroundColor:item.color}]}/><Text style={s.caption}>{item.label}</Text></View><View style={s.countRow}><Text style={s.count}>{item.value}</Text><Text style={s.share}>{item.share}</Text></View></View>)}</View>
  </View>;
}

const s=StyleSheet.create({
  card:{backgroundColor:'white',borderWidth:1,borderColor:'#dce4f0',borderRadius:16,padding:16,marginBottom:16,gap:18},heading:{flexDirection:'row',alignItems:'center',gap:12,flexWrap:'wrap'},flex:{flex:1,minWidth:130,gap:4},title:{fontSize:20,fontWeight:'600',color:'#23334d'},caption:{fontSize:12,color:'#718098'},period:{minHeight:44,flexDirection:'row',alignItems:'center',gap:8,paddingHorizontal:10,borderWidth:1,borderColor:'#dce4f0',borderRadius:10,backgroundColor:'#f7faff'},periodText:{fontSize:12,color:'#27549a'},summary:{flexDirection:'row',alignItems:'flex-end',justifyContent:'space-between',gap:10,flexWrap:'wrap'},amount:{fontSize:32,fontWeight:'700',color:'#0755d7',marginTop:4},unit:{fontSize:22,color:'#0755d7'},currency:{flexDirection:'row',alignItems:'center',gap:6,paddingBottom:8},dot:{width:8,height:8,borderRadius:4,backgroundColor:'#0755d7'},chart:{flexDirection:'row',gap:8},axis:{height:144,justifyContent:'space-between',width:37},axisLabel:{fontSize:11,color:'#8490a4'},plot:{flex:1,minWidth:0},grid:{position:'absolute',top:0,left:0,right:0,height:144,justifyContent:'space-between'},gridLine:{borderTopWidth:1,borderColor:'#edf1f7'},columns:{flexDirection:'row',gap:8},column:{flex:1,minWidth:0,alignItems:'center',gap:8},barSpace:{height:144,width:'100%',justifyContent:'flex-end',alignItems:'center'},bar:{width:'82%',maxWidth:42,borderTopLeftRadius:6,borderTopRightRadius:6},month:{fontSize:11,color:'#8090a6',textAlign:'center'},selectedMonth:{color:'#0755d7',fontWeight:'700'},hint:{fontSize:11,color:'#8795a9',textAlign:'center'},growthIcon:{width:44,height:44,borderRadius:12,backgroundColor:'#edf4ff',alignItems:'center',justifyContent:'center'},growthSummary:{flexDirection:'row',alignItems:'center',justifyContent:'space-between',gap:12,flexWrap:'wrap'},growthBadge:{flexDirection:'row',alignItems:'center',gap:6,padding:10,borderRadius:10,backgroundColor:'#eaf8f1',flexWrap:'wrap'},growthPercent:{fontSize:16,fontWeight:'700',color:'#167459'},target:{fontSize:11,color:'#167459'},distribution:{height:16,flexDirection:'row',gap:3,borderRadius:8,overflow:'hidden'},newSegment:{flex:24,backgroundColor:'#0755d7'},returningSegment:{flex:96,backgroundColor:'#9dbdf1'},breakdown:{flexDirection:'row',flexWrap:'wrap',gap:10},breakdownCard:{flex:1,minWidth:110,padding:12,backgroundColor:'#f5f8fd',borderRadius:10,gap:10},legend:{flexDirection:'row',alignItems:'center',gap:6},countRow:{flexDirection:'row',alignItems:'center',justifyContent:'space-between',gap:8},count:{fontSize:23,fontWeight:'600',color:'#263952'},share:{fontSize:12,color:'#718098'},
});
