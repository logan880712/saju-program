import type {SajuResult,Element} from './types';
export type GodGroup='비겁'|'식상'|'재성'|'관성'|'인성';
export interface GodSource {position:string;layer:'천간'|'본기'|'지장간';hanja:string;god:string;}
export interface NatalProfile {season:'봄'|'여름'|'가을'|'겨울';monthBranch:string;monthMainGod:string;groups:Record<GodGroup,{visible:GodSource[];hidden:GodSource[]}>;roots:{position:string;branch:string;stems:string[]}[];elementLocations:Record<Element,string[]>;}
export function godGroup(god:string):GodGroup{return god==='비견'||god==='겁재'?'비겁':god==='식신'||god==='상관'?'식상':god==='편재'||god==='정재'?'재성':god==='편관'||god==='정관'?'관성':'인성';}
/** Structural facts only: no strength score, favorable element or pattern certification. */
export function calculateNatalProfile(natal:SajuResult):NatalProfile{
 const groups:NatalProfile['groups']={비겁:{visible:[],hidden:[]},식상:{visible:[],hidden:[]},재성:{visible:[],hidden:[]},관성:{visible:[],hidden:[]},인성:{visible:[],hidden:[]}};
 const roots:NatalProfile['roots']=[],elements:NatalProfile['elementLocations']={목:[],화:[],토:[],금:[],수:[]};
 for(const p of natal.pillars){
  if(p.key!=='day')groups[godGroup(p.stemTenGod)].visible.push({position:p.label,layer:'천간',hanja:p.stem.hanja,god:p.stemTenGod});
  groups[godGroup(p.branchTenGod)].visible.push({position:p.label,layer:'본기',hanja:p.hiddenStems[0].hanja,god:p.branchTenGod});
  p.hiddenStems.slice(1).forEach(s=>groups[godGroup(s.tenGod)].hidden.push({position:p.label,layer:'지장간',hanja:s.hanja,god:s.tenGod}));
  const matching=p.hiddenStems.filter(s=>s.element===natal.pillars[2].stem.element);
  if(matching.length)roots.push({position:p.label,branch:p.branch.hanja,stems:matching.map(s=>s.hanja)});
  elements[p.stem.element].push(`${p.label} 천간 ${p.stem.hanja}`);elements[p.branch.element].push(`${p.label} 지지 ${p.branch.hanja}`);
 }
 const month=natal.pillars[1],season='寅卯辰'.includes(month.branch.hanja)?'봄':'巳午未'.includes(month.branch.hanja)?'여름':'申酉戌'.includes(month.branch.hanja)?'가을':'겨울';
 return {season,monthBranch:month.branch.hanja,monthMainGod:month.branchTenGod,groups,roots,elementLocations:elements};
}
