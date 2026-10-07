export type Element = '목'|'화'|'토'|'금'|'수';
export interface BirthInput { name:string; gender:'남성'|'여성'|'선택 안 함'; calendar:'solar'|'lunar'; date:string; time:string; region:string; leapMonth:boolean; }
export interface Character { hanja:string; korean:string; element:Element; polarity:'양'|'음'; }
export interface Pillar { key:'year'|'month'|'day'|'hour'; label:string; ganji:string; stem:Character; branch:Character; stemTenGod:string; branchTenGod:string; hiddenStems:(Character & {tenGod:string})[]; }
export interface SajuResult { schemaVersion:'1.0'; input:BirthInput; solarDate:string; lunarDate:{year:number;month:number;day:number;intercalation?:boolean}; pillars:Pillar[]; elementCounts:Record<Element,number>; calculation:{engine:string;timezone:string;utcOffsetMinutes:number;dstCorrectionMinutes:number;standardTime:string;timeZoneData:string;yearBoundary:string;monthBoundary:string;dayBoundary:string;timeBasis:string}; warnings:string[]; }
