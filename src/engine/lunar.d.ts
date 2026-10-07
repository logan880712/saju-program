declare module 'lunar-javascript' {
 interface EightChar { setSect(n:number):void; getYear():string; getMonth():string; getDay():string; getTime():string; }
 interface Lunar { getEightChar():EightChar; getJieQiTable():Record<string,SolarDate>; }
 interface SolarDate { getYear():number;getMonth():number;getDay():number;getHour():number;getMinute():number;getSecond():number;getLunar():Lunar;toYmdHms():string; }
 export const Solar: { fromYmdHms(y:number,m:number,d:number,h:number,min:number,s:number):SolarDate };
}
