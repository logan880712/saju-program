import type { SajuResult } from '../engine/types';
// 향후 AI 제공자는 계산이 끝난 원국만 입력받습니다. 생년월일로 원국을 생성하지 않습니다.
export interface InterpretationProvider {
 interpret(result:Readonly<SajuResult>,topic:'general'|'wealth'|'career'|'relationship'):Promise<{text:string;basedOnSchemaVersion:string}>;
}
