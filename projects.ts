import {addDoc,collection,deleteDoc,doc,getDocs,orderBy,query,serverTimestamp,setDoc,updateDoc,where,writeBatch} from "firebase/firestore";
import {deleteObject,getDownloadURL,ref,uploadBytes} from "firebase/storage";
import {configured,db,storage} from "./firebase";
export type Img={url:string;path:string};
export type Project={id:string;title:string;description:string;category:string;tags:string[];date:string;featured:boolean;status:"draft"|"published";order:number;cover:Img|null;images:Img[]};
export type Msg={id:string;name:string;email:string;type:string;message:string;at:Date|null};
const toP=(d:{id:string;data:()=>Record<string,unknown>}):Project=>({id:d.id,...(d.data() as Omit<Project,"id">)});
const byOrder=(a:Project,b:Project)=>a.order-b.order;
/** null = Firebase not configured / unreachable (site falls back to sample content) */
export async function fetchPublished():Promise<Project[]|null>{
  if(!configured)return null;
  try{const s=await getDocs(query(collection(db,"projects"),where("status","==","published")));return s.docs.map(toP).sort(byOrder)}catch{return null}
}
export async function fetchAll(){const s=await getDocs(collection(db,"projects"));return s.docs.map(toP).sort(byOrder)}
export async function saveProject(o:{id?:string;data:Omit<Project,"id"|"cover"|"images">;cover:File|null;keepCover:Img|null;newImages:File[];keepImages:Img[];removePaths:string[]}){
  const d=o.id?doc(db,"projects",o.id):doc(collection(db,"projects"));
  const up=async(f:File):Promise<Img>=>{const path=`projects/${d.id}/${Date.now()}-${Math.random().toString(36).slice(2,7)}-${f.name.replace(/[^\w.-]/g,"_")}`;await uploadBytes(ref(storage,path),f,{contentType:f.type});return{url:await getDownloadURL(ref(storage,path)),path}};
  const cover=o.cover?await up(o.cover):o.keepCover;
  const added=await Promise.all(o.newImages.map(up));
  await setDoc(d,{...o.data,cover,images:[...o.keepImages,...added],updatedAt:serverTimestamp()},{merge:true});
  await Promise.all(o.removePaths.map(p=>deleteObject(ref(storage,p)).catch(()=>{})));
}
export const setStatus=(p:Project,status:Project["status"])=>updateDoc(doc(db,"projects",p.id),{status});
export const setFeatured=(p:Project,featured:boolean)=>updateDoc(doc(db,"projects",p.id),{featured});
export async function swapOrder(a:Project,b:Project){const w=writeBatch(db);w.update(doc(db,"projects",a.id),{order:b.order});w.update(doc(db,"projects",b.id),{order:a.order});await w.commit()}
export async function deleteProject(p:Project){await Promise.all([...(p.cover?[p.cover]:[]),...p.images].map(i=>deleteObject(ref(storage,i.path)).catch(()=>{})));await deleteDoc(doc(db,"projects",p.id))}
export async function sendMessage(m:{name:string;email:string;type:string;message:string}){if(!configured)throw new Error("not configured");await addDoc(collection(db,"messages"),{...m,createdAt:serverTimestamp()})}
export async function fetchMessages():Promise<Msg[]>{const s=await getDocs(query(collection(db,"messages"),orderBy("createdAt","desc")));return s.docs.map(d=>{const x=d.data();return{id:d.id,name:x.name,email:x.email,type:x.type,message:x.message,at:x.createdAt?.toDate?.()??null}})}
