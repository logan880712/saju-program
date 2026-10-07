import type {Relation} from './fortuneTypes';
const groups:{type:Relation['type'];pairs:string[];description:string}[]=[
 {type:'천간합',pairs:['甲己','乙庚','丙辛','丁壬','戊癸'],description:'서로 묶이는 천간의 관계입니다. 실제 합화 여부는 월령과 전체 원국을 별도로 검토해야 합니다.'},
 {type:'육합',pairs:['子丑','寅亥','卯戌','辰酉','巳申','午未'],description:'연결·협력을 살펴보는 지지 관계입니다. 합이 있다고 무조건 유리한 것은 아닙니다.'},
 {type:'충',pairs:['子午','丑未','寅申','卯酉','辰戌','巳亥'],description:'서로 다른 방향이 맞서는 관계입니다. 변화와 조정의 상징이며 사건이나 이동을 확정하지 않습니다.'},
 {type:'형',pairs:['寅巳','巳申','申寅','丑戌','戌未','未丑','子卯','辰辰','午午','酉酉','亥亥'],description:'긴장과 기준의 충돌을 점검하는 배속입니다. 삼형은 쌍별 관계만 표시하며 세 글자 완성을 판정하지 않습니다.'},
 {type:'파',pairs:['子酉','丑辰','寅亥','卯午','巳申','未戌'],description:'약속이나 구조의 세부 조정을 살펴보는 배속입니다. 결과의 길흉을 단정하지 않습니다.'},
 {type:'해',pairs:['子未','丑午','寅巳','卯辰','申亥','酉戌'],description:'기대와 이해의 어긋남을 살펴보는 배속입니다. 상대의 의도나 실제 피해를 추측하지 않습니다.'},
];
export function pairRelations(a:string,b:string,left:string,right:string):Relation[]{
 const out:Relation[]=[];
 for(const group of groups){const pair=group.type==='천간합'?a[0]+b[0]:a[1]+b[1];if(group.pairs.some(p=>p===pair||p===pair[1]+pair[0]))out.push({type:group.type,left,right,pair,description:group.type==='형'&&pair[0]===pair[1]?'같은 지지가 두 자리에 반복된 자형 관계입니다. 반복해서 점검하는 기준과 자기 요구를 살펴보는 전통 배속입니다.':group.type==='형'&&('子卯'.includes(pair[0])&&'子卯'.includes(pair[1]))?'자와 묘의 형 관계입니다. 서로 다른 기대와 표현 방식을 맞춰보는 전통 배속입니다.':group.description});}
 return out;
}
export function natalRelations(pillars:{ganji:string;label:string}[]):Relation[]{return pillars.flatMap((a,i)=>pillars.slice(i+1).flatMap(b=>pairRelations(a.ganji,b.ganji,a.label,b.label)));}
