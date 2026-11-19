import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { catalog, resourceFor, type Action, type Field, type Resource } from '../api-shared/catalog';
import { actionRequest, availableActions, detailsOf, draftFor, fieldsForEdit, idOf, rowsOf, titleOf, type RecordData } from '../api-shared/records';
import { api, logout, updateWorkspace, useSession } from './session';
import { download } from './download';
import { styles } from './styles';

type Operation=Action & {row?:RecordData};
function Button({title,onPress,disabled=false}:{title:string;onPress:()=>void;disabled?:boolean}) {
  return <Pressable accessibilityRole="button" accessibilityState={{disabled}} disabled={disabled} style={[styles.secondary,disabled&&{opacity:.5}]} onPress={onPress}><Text>{title}</Text></Pressable>;
}
function Details({value}:{value:unknown}) {
  return <>{detailsOf(value).map((item,i)=><View key={i} style={styles.detail}><Text style={styles.muted}>{item.label}</Text><Text selectable>{item.value}</Text></View>)}</>;
}
function Select({label,value,options,onChange}:{label:string;value:string;options:{value:string;label:string}[];onChange:(value:string)=>void}) {
  const [open,setOpen]=useState(false);
  return <><Button title={options.find(o=>o.value===value)?.label||`Select ${label.toLowerCase()}`} onPress={()=>setOpen(true)}/><Modal visible={open} transparent onRequestClose={()=>setOpen(false)} animationType="fade"><View style={styles.overlay}><View style={styles.dialog}><Text style={styles.heading}>{label}</Text><ScrollView>{[{value:'',label:'None'},...options].map(option=><Button key={option.value} title={option.label} onPress={()=>{onChange(option.value);setOpen(false);}}/>)}</ScrollView><Button title="Close" onPress={()=>setOpen(false)}/></View></View></Modal></>;
}
function Fields({fields,draft,setDraft,choices}:{fields:Field[];draft:Record<string,string>;setDraft:(value:Record<string,string>)=>void;choices:Record<string,RecordData[]>}) {
  return <>{fields.map(field=><View key={field.key} style={{gap:8}}><Text>{field.label}{field.required?' *':''}</Text>
    {field.type==='multi'?(choices[field.source||'']||[]).map(row=>{const ids=(draft[field.key]||'').split(',').filter(Boolean),id=idOf(row);return <Button key={id} title={`${ids.includes(id)?'✓ ':''}${titleOf(row)}`} onPress={()=>setDraft({...draft,[field.key]:(ids.includes(id)?ids.filter(i=>i!==id):[...ids,id]).join(',')})}/>;}):['select','boolean'].includes(field.type||'')?<Select label={field.label} value={draft[field.key]||''} onChange={value=>setDraft({...draft,[field.key]:value})} options={field.type==='boolean'?[{value:'true',label:'Yes'},{value:'false',label:'No'}]:field.source?(choices[field.source]||[]).map(row=>({value:idOf(row),label:titleOf(row)})):(field.options||[]).map(value=>({value,label:value.replace(/_/g,' ')}))}/>:<TextInput accessibilityLabel={field.label} style={styles.input} value={draft[field.key]||''} onChangeText={value=>setDraft({...draft,[field.key]:value})} secureTextEntry={field.type==='password'} autoCapitalize={['email','password'].includes(field.type||'')?'none':'sentences'} keyboardType={field.type==='number'?'decimal-pad':field.type==='tel'?'phone-pad':field.type==='email'?'email-address':'default'} placeholder={field.type==='date'?'YYYY-MM-DD':field.type==='time'?'HH:MM':field.type==='datetime-local'?'YYYY-MM-DDTHH:MM (local time)':''}/>}
  </View>)}</>;
}
function Editor({operation,onClose,onSaved}:{operation:Operation;onClose:()=>void;onSaved:(result:RecordData,method:string)=>void}) {
  const [draft,setDraft]=useState(()=>draftFor(operation.fields||[],operation.row));
  const [choices,setChoices]=useState<Record<string,RecordData[]>>({}),[error,setError]=useState(''),[loading,setLoading]=useState(true),[busy,setBusy]=useState(false);
  useEffect(()=>{
    let active=true;
    Promise.all([...new Set((operation.fields||[]).map(f=>f.source).filter((s):s is string=>!!s))].map(async path=>[path,rowsOf(await api.request(path))]))
      .then(entries=>{if(active)setChoices(Object.fromEntries(entries));}).catch(e=>{if(active)setError(e.message);}).finally(()=>{if(active)setLoading(false);});
    return()=>{active=false;};
  },[operation]);
  async function save() {
    if(busy)return;setBusy(true);setError('');
    try {
      const {path,init}=await actionRequest(operation,draft,operation.row||{},api.request);
      const result=await api.request(path,init);
      if(operation.path==='/workspaces/me'&&operation.method==='PATCH')updateWorkspace(result);
      onSaved(result,operation.method);
    }catch(e){setError(e instanceof Error?e.message:'Unable to save.');}finally{setBusy(false);}
  }
  return <Modal visible animationType="slide" onRequestClose={()=>{if(!busy)onClose();}}><SafeAreaView style={styles.safe}><KeyboardAvoidingView style={styles.safe} behavior={Platform.OS==='ios'?'padding':'height'}><ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.content}><Text style={styles.title}>{operation.label}</Text>
    {operation.method==='DELETE'&&<Text>Remove {titleOf(operation.row||{})}? Confirm to continue.</Text>}
    {loading?<ActivityIndicator/>:<Fields fields={operation.fields||[]} draft={draft} setDraft={setDraft} choices={choices}/>}
    {!!error&&<Text accessibilityRole="alert" style={styles.error}>{error}</Text>}
    <Button title={busy?'Saving…':'Confirm'} disabled={busy||loading} onPress={save}/><Button title="Cancel" disabled={busy} onPress={onClose}/>
  </ScrollView></KeyboardAvoidingView></SafeAreaView></Modal>;
}
function ResourceView({resource,detailId}:{resource:Resource;detailId?:string}) {
  const session=useSession(), admin=session.user?.role==='ADMIN';
  const [data,setData]=useState<RecordData|RecordData[]|null>(null),[error,setError]=useState(''),[loading,setLoading]=useState(true);
  const [operation,setOperation]=useState<Operation|null>(null),[result,setResult]=useState<RecordData|null>(null),[notice,setNotice]=useState('');
  const [filters,setFilters]=useState<Record<string,string>>({}),[applied,setApplied]=useState<Record<string,string>>({}),[page,setPage]=useState(1),[choices,setChoices]=useState<Record<string,RecordData[]>>({});
  const version=useRef(0);
  const load=useCallback(async()=>{
    const current=++version.current;setLoading(true);setError('');
    try {
      const query=new URLSearchParams({...applied,...(['school-alerts','interactions'].includes(resource.key)?{page:String(page),limit:'20'}:{})}).toString();
      const next=resource.path?await api.request(resource.path+(detailId?`/${encodeURIComponent(detailId)}`:'')+(query?`?${query}`:'')):null;
      if(current===version.current)setData(next);
    }catch(e){if(current===version.current){setData(null);setError(e instanceof Error?e.message:'Unable to load records.');}}
    finally{if(current===version.current)setLoading(false);}
  },[resource,detailId,applied,page]);
  useEffect(()=>{const sequence=version;const timer=setTimeout(load,0);return()=>{clearTimeout(timer);sequence.current++;};},[load]);
  useEffect(()=>{
    let active=true;
    Promise.all([...new Set((resource.filters||[]).map(f=>f.source).filter((s):s is string=>!!s))].map(async path=>[path,rowsOf(await api.request(path))]))
      .then(entries=>{if(active)setChoices(Object.fromEntries(entries));}).catch(e=>{if(active)setError(e.message);});
    return()=>{active=false;};
  },[resource]);
  async function act(action:Action,row?:RecordData) {
    if(action.download){setError('');try{await download(action.path.replace(':id',encodeURIComponent(idOf(row||{}))),action.download);}catch(e){setError(e instanceof Error?e.message:'Unable to download.');}}
    else setOperation({...action,row});
  }
  const rows:RecordData[]=detailId&&data?[data as RecordData]:rowsOf(data);
  const pagination=(data as RecordData)?.pagination;
  const canWrite=!resource.admin||admin;
  return <>
    <View style={styles.actions}><Button title="Refresh" disabled={loading} onPress={load}/>
      {!!resource.fields&&canWrite&&<Button title="＋ Add record" onPress={()=>setOperation({label:`Add ${resource.title.toLowerCase()}`,path:resource.path,method:'POST',fields:resource.fields})}/>}
      {resource.actions?.filter(a=>!a.admin||admin).map(a=><Button key={a.label} title={a.label} onPress={()=>act(a,data as RecordData)}/>)}
      {!!resource.download&&<Button title="Export CSV" onPress={()=>act({label:'Export',path:resource.download!,method:'GET',download:`${resource.key}.csv`})}/>}
    </View>
    {!!resource.filters?.length&&!detailId&&<View style={styles.card}><Fields fields={resource.filters} draft={filters} setDraft={setFilters} choices={choices}/><Button title="Apply filters" onPress={()=>{setApplied(Object.fromEntries(Object.entries(filters).filter(([,v])=>v)));setPage(1);}}/></View>}
    {!!error&&<Text accessibilityRole="alert" style={styles.error}>{error}</Text>}{!!notice&&<Text accessibilityLiveRegion="polite">{notice}</Text>}
    {!!result&&<View style={styles.card}><Text style={styles.heading}>Result</Text><Details value={result}/></View>}
    {loading?<ActivityIndicator accessibilityLabel="Loading records"/>:!error&&(resource.single?(data&&<View style={styles.card}><Details value={data}/></View>):<>
      {!rows.length&&<View style={styles.card}><Text style={styles.heading}>No records yet</Text><Text>Saved records will appear here.</Text></View>}
      {rows.map((row,i)=><View style={styles.card} key={idOf(row)||i}><Text style={styles.heading}>{titleOf(row)}</Text><Details value={row}/><View style={styles.actions}>
        {resource.edit&&canWrite&&<Button title="Edit" onPress={()=>setOperation({label:'Edit record',path:`${resource.path}/${idOf(row)}`,method:'PATCH',fields:fieldsForEdit(resource.fields||[],resource.path),row})}/>}
        {resource.remove&&canWrite&&<Button title={resource.key==='barber-services'?'Deactivate':'Delete'} onPress={()=>setOperation({label:'Remove record',path:`${resource.path}/${idOf(row)}`,method:'DELETE',row})}/>}
        {availableActions(resource.rowActions,row).map(a=><Button key={a.label} title={a.label} onPress={()=>act(a,row)}/>)}
      </View></View>)}
      {!!pagination&&<View style={styles.actions}><Button title="Previous" disabled={page<=1||loading} onPress={()=>setPage(page-1)}/><Text>Page {page} of {Math.max(1,pagination.totalPages)}</Text><Button title="Next" disabled={page>=pagination.totalPages||loading} onPress={()=>setPage(page+1)}/></View>}
    </>)}
    {!!operation&&<Editor operation={operation} onClose={()=>setOperation(null)} onSaved={(next,method)=>{setOperation(null);setResult(next);setNotice(method==='GET'?'Result loaded.':'Saved successfully.');if(method!=='GET')load();}}/>}
  </>;
}
export default function Workspace({screen='school-dashboard',detailId}:{screen?:string;detailId?:string}) {
  const session=useSession(),[menu,setMenu]=useState(false),[error,setError]=useState('');
  const resource=resourceFor(screen);
  const enabled=(group:string)=>group==='Workspace'||session.workspace?.[`${group.toLowerCase()}Enabled`]!==false;
  if(!session.user)return <View style={styles.safe}><ActivityIndicator/></View>;
  return <SafeAreaView style={styles.safe}>
    <View style={styles.header}><Button title="☰ Menu" onPress={()=>setMenu(true)}/><Text style={styles.brand}>Smart CRM</Text><Text>{session.user.name}</Text></View>
    <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.content}><Text style={styles.muted}>{session.workspace?.name}</Text><Text style={styles.title}>{resource.title}</Text>
      {enabled(resource.group)?<ResourceView key={`${resource.key}:${detailId||''}`} resource={resource} detailId={detailId}/>:<Text>This module is disabled for this workspace.</Text>}
    </ScrollView>
    <Modal visible={menu} animationType="slide" onRequestClose={()=>setMenu(false)}><SafeAreaView style={styles.safe}><ScrollView contentContainerStyle={styles.content}><Text style={styles.brand}>{session.workspace?.name}</Text><Button title="Close menu" onPress={()=>setMenu(false)}/>
      {['School','Gym','Barber','Workspace'].filter(enabled).map(group=><View style={styles.card} key={group}><Text style={styles.heading}>{group}</Text>{catalog.filter(r=>r.group===group).map(item=><Button key={item.key} title={item.title} onPress={()=>{setMenu(false);router.push({pathname:'/workspace',params:{screen:item.key}});}}/>)}</View>)}
      {!!error&&<Text style={styles.error}>{error}</Text>}<Button title="Log out" onPress={()=>{logout().then(()=>{setMenu(false);router.replace('/');}).catch(e=>setError(e.message));}}/>
    </ScrollView></SafeAreaView></Modal>
  </SafeAreaView>;
}
