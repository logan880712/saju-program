export interface BirthDateDraft {
 canonical:string;
 complete:boolean;
 message:string;
}

/** Parse the written digits only. Calendar existence is checked by the saju engine. */
export function parseBirthDateDraft(raw:string):BirthDateDraft {
 if(!raw)return {canonical:'',complete:false,message:'생년월일을 입력해주세요.'};
 const matched=/^(\d{4})(\d{2})(\d{2})$/.exec(raw)||/^(\d{4})-(\d{2})-(\d{2})$/.exec(raw);
 if(!matched)return {canonical:'',complete:false,message:'생년월일은 19880712처럼 연도 4자리·월 2자리·일 2자리로 입력해주세요.'};
 const [,year,month,day]=matched,canonical=`${year}-${month}-${day}`;
 if(Number(month)<1||Number(month)>12)return {canonical,complete:true,message:'월은 01~12 사이로 입력해주세요.'};
 if(Number(day)<1||Number(day)>31)return {canonical,complete:true,message:'일은 01~31 사이로 입력해주세요. 음력 날짜의 존재 여부는 계산할 때 확인해요.'};
 return {canonical,complete:true,message:''};
}

export function birthDateDigits(canonical:string):string {
 return /^\d{4}-\d{2}-\d{2}$/.test(canonical)?canonical.replaceAll('-',''):canonical;
}
