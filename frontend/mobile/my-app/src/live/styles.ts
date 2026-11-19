import { StyleSheet } from 'react-native';
export const styles=StyleSheet.create({
  safe:{flex:1,backgroundColor:'#f5f7fb'},content:{padding:20,gap:18,width:'100%',maxWidth:840,alignSelf:'center'},
  header:{padding:16,backgroundColor:'white',borderBottomWidth:1,borderColor:'#dce3ee',flexDirection:'row',flexWrap:'wrap',alignItems:'center',gap:12},
  brand:{fontSize:24,fontWeight:'700',color:'#0754d5'},title:{fontSize:25,fontWeight:'700',color:'#202c43'},heading:{fontSize:18,fontWeight:'600',color:'#202c43'},
  muted:{color:'#68758b',lineHeight:22},card:{padding:18,gap:12,backgroundColor:'white',borderWidth:1,borderColor:'#dce3ee',borderRadius:12},
  input:{minHeight:48,padding:12,borderWidth:1,borderColor:'#ccd8e9',borderRadius:8,backgroundColor:'white',color:'#202c43'},
  button:{minHeight:46,padding:13,backgroundColor:'#0754d5',borderRadius:8,alignItems:'center'},white:{color:'white',fontWeight:'600'},
  secondary:{minHeight:44,padding:12,borderWidth:1,borderColor:'#ccd8e9',borderRadius:8,alignItems:'center',backgroundColor:'white'},
  actions:{flexDirection:'row',flexWrap:'wrap',gap:8},error:{padding:12,backgroundColor:'#fff0f0',color:'#9c2222',borderRadius:8},
  detail:{borderBottomWidth:1,borderColor:'#edf0f5',paddingBottom:8,gap:4},overlay:{flex:1,backgroundColor:'#172b4d88',justifyContent:'center',padding:20},dialog:{backgroundColor:'white',borderRadius:14,padding:20,maxHeight:'90%',gap:14},
});
