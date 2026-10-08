import type {NatalProfile} from './profile';
import type {Character, SajuResult} from './types';
export interface LuckPillar {ganji:string;stem:Character;branch:Character;stemTenGod:string;branchTenGod:string;}
export interface Relation {type:'천간합'|'육합'|'충'|'형'|'파'|'해';left:string;right:string;pair:string;description:string;}
export interface LuckPeriod extends LuckPillar {index:number;startDate:string;endDate:string;approxAge:number;active:boolean;relations:Relation[];}
export interface AnnualLuck extends LuckPillar {year:number;startDate:string;endDate:string;relations:Relation[];cycleRelations:Relation[];}
export interface MonthLuck extends LuckPillar {index:number;term:string;startDate:string;endDate:string;relations:Relation[];}
export interface FortuneData {profile:NatalProfile;referenceDate:string;referenceYear:number;calendar:{at:string;annual:AnnualLuck;month:MonthLuck};cycles:{status:'calculated'|'gender_required';direction?:'순행'|'역행';startAge?:{years:number;months:number;days:number;hours:number};startDate?:string;periods:LuckPeriod[];note:string};annual:AnnualLuck[];months:MonthLuck[];daily:LuckPillar & {date:string;relations:Relation[]};natalRelations:Relation[];methods:string[];}
export interface ReadingSection {id:string;title:string;subtitle:string;paragraphs:string[];notes?:string[];evidence:string[];actions:string[];}
export interface Interpretation {method:'traditional-rules-v2';intro:string;sections:ReadingSection[];annual:Record<number,ReadingSection>;months:ReadingSection[];daily:ReadingSection;cycles:ReadingSection[];limitations:string[];}
export interface FullReport {schemaVersion:'2.0';natal:SajuResult;fortune:FortuneData;interpretation:Interpretation;}
