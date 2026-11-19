import { Text } from '@/components/responsive-text';
import { useState } from 'react';
import { Platform, Pressable, StyleSheet, View } from 'react-native';
import { report, reportCsv, reportHtml } from './barber-bookings-store';
import { money } from './barber-store';
export default function BarberReports() {
  const [busy,setBusy]=useState(false),[notice,setNotice]=useState('');
  async function exportReport(format:'csv'|'pdf') {
    setBusy(true);setNotice('');
    try {
      if(Platform.OS==='web') {
        if(format==='pdf') { const Print=await import('expo-print');await Print.printAsync({html:reportHtml()}); }
        else { const url=URL.createObjectURL(new Blob([reportCsv()],{type:'text/csv'}));const a=document.createElement('a');a.href=url;a.download='barber-sample-report.csv';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000); }
        return;
      }
      const Sharing=await import('expo-sharing');
      if(!await Sharing.isAvailableAsync())throw new Error('Sharing is unavailable on this device.');
      let uri:string;
      if(format==='pdf') { const Print=await import('expo-print');uri=(await Print.printToFileAsync({html:reportHtml()})).uri; }
      else { const {File,Paths}=await import('expo-file-system');const file=new File(Paths.cache,'barber-sample-report.csv');file.create({overwrite:true});file.write(reportCsv());uri=file.uri; }
      await Sharing.shareAsync(uri,{mimeType:format==='pdf'?'application/pdf':'text/csv',dialogTitle:'Export Barber Report'});
    } catch(error) {setNotice(error instanceof Error?error.message:'Unable to export report. Please try again.');} finally {setBusy(false);}
  }
  return <View style={s.page}>{[["Today's Revenue",money(report.revenue),'↗ 12%'],['Appointments','12','Busy Day'],['Avg Ticket Value',money(Math.round(report.revenue/report.appointments)),'Target: $65']].map(([label,value,note],i)=><View key={label} style={s.panel}><Text style={s.label}>{label}</Text><View style={s.row}><Text style={[s.value,i===0&&{color:'#0053da'}]}>{value}</Text><Text style={s.pill}>{note}</Text></View></View>)}<Text style={s.caption}>Sample report · Last 7 days · Not live accounts</Text><View style={s.panel}><View style={s.row}><Text style={s.heading}>Revenue Trends</Text><Text style={s.link}>Last 7 Days</Text></View><View style={s.chart}>{report.trend.map((value,i)=><View key={i} style={s.column}><View style={{height:value/3,backgroundColor:i===3?'#0052d5':`rgba(30,98,210,${.25+i*.1})`,width:'100%'}}/><Text style={s.day}>{report.days[i]}</Text></View>)}</View></View><View style={s.panel}><Text style={s.heading}>Service Popularity</Text>{report.popularity.map(item=><View key={item.name} style={{gap:6}}><View style={s.row}><Text style={s.text}>{item.name}</Text><Text style={s.text}>{item.count}</Text></View><View style={s.track}><View style={[s.fill,{width:`${item.count/50*100}%`}]}/></View></View>)}</View><View style={s.panel}><Text style={s.heading}>Barber Performance</Text>{report.staff.map(staff=><View key={staff.name} style={s.row}><View style={s.avatar}><Text style={s.link}>{staff.name.split(' ').map(n=>n[0]).join('')}</Text></View><View style={{flex:1}}><Text style={s.text}>{staff.name}</Text><Text style={s.caption}>{staff.bookings} Bookings</Text></View><Text style={s.link}>{money(staff.cents)}</Text></View>)}</View><Text style={s.heading}>Export PDF/CSV Reports</Text><View style={s.row}>{(['pdf','csv'] as const).map(format=><Pressable key={format} accessibilityRole="button" disabled={busy} style={[s.button,busy&&{opacity:.5}]} onPress={()=>exportReport(format)}><Text style={{color:'white',fontWeight:'600'}}>↓ Export {format.toUpperCase()}</Text></Pressable>)}</View>{!!notice && <Text accessibilityRole="alert" style={s.caption}>{notice}</Text>}<Text style={s.caption}>Scheduled report delivery requires backend integration.</Text></View>;
}
const s=StyleSheet.create({page:{gap:16},panel:{backgroundColor:'white',borderWidth:1,borderColor:'#e0e7f0',borderRadius:10,padding:20,gap:17,boxShadow:'0 2px 4px #142f4710'},label:{fontSize:12,color:'#475369',letterSpacing:.5},row:{flexDirection:'row',alignItems:'center',justifyContent:'space-between',gap:12},value:{fontSize:30,fontWeight:'700',color:'#242b30'},pill:{fontSize:10,color:'#165d8b',backgroundColor:'#e1ecff',paddingHorizontal:7,paddingVertical:3,borderRadius:8},caption:{fontSize:11,color:'#748097',lineHeight:16},heading:{fontSize:19,fontWeight:'500',color:'#242b30'},link:{fontSize:12,color:'#0655dc',fontWeight:'600'},text:{fontSize:13,color:'#29313d'},chart:{flexDirection:'row',height:220,alignItems:'flex-end',gap:7,borderBottomWidth:1,borderColor:'#dce4ef'},column:{flex:1,gap:10,alignItems:'center'},day:{fontSize:9,color:'#69748b',marginBottom:8},track:{height:7,backgroundColor:'#e9edf2',borderRadius:5},fill:{height:'100%',backgroundColor:'#0652d1',borderRadius:5},avatar:{width:37,height:37,borderRadius:20,backgroundColor:'#dce8f6',alignItems:'center',justifyContent:'center'},button:{flex:1,alignItems:'center',padding:16,borderRadius:9,backgroundColor:'#2460ed'}});
