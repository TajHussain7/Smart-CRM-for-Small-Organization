import { Platform } from 'react-native';
import { File, Paths } from 'expo-file-system';
import { isAvailableAsync, shareAsync } from 'expo-sharing';
import { api } from './session';
export async function download(path:string,filename:string) {
  const response=await api.download(path);
  if(Platform.OS==='web') {
    const url=URL.createObjectURL(await response.blob());
    const link=document.createElement('a');link.href=url;link.download=filename;link.click();
    setTimeout(()=>URL.revokeObjectURL(url),1000);
  } else {
    if(!await isAvailableAsync()) throw new Error('File sharing is unavailable on this device.');
    const file=new File(Paths.cache,filename);
    file.write(new Uint8Array(await response.arrayBuffer()));
    await shareAsync(file.uri);
  }
}
