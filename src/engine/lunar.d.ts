declare module 'lunar-javascript' {
 interface Yun {isForward():boolean;getStartYear():number;getStartMonth():number;getStartDay():number;getStartHour():number;getStartSolar():SolarDate;getDaYun(n:number):{getGanZhi():string}[];}
 interface EightChar { getYun(gender:number,sect:number):Yun; setSect(n:number):void; getYear():string; getMonth():string; getDay():string; getTime():string; }
 interface Lunar { getEightChar():EightChar; getJieQiTable():Record<string,SolarDate>; }
 export interface SolarDate { nextYear(n:number):SolarDate; getYear():number;getMonth():number;getDay():number;getHour():number;getMinute():number;getSecond():number;getLunar():Lunar;toYmdHms():string; }
 export const Solar: { fromYmdHms(y:number,m:number,d:number,h:number,min:number,s:number):SolarDate };
}
