import browserMimeMapping from './browserMimeMapping';
interface realMimeMapping {
    [key: string]: string;
}
interface realExtMapping {
    [key: string]: string;
}
declare const realMimeMapping: realMimeMapping;
declare const realExtMapping: realExtMapping;
declare class TypeFile {
    static COMPARE_TYPE: {
        REAL_FIRST: number;
        BROWSER_FIRST: number;
        REAL_ONLY: number;
        BROWSER_ONLY: number;
    };
    static compare(mime: null | string, targetMimeType: string): Boolean;
    static compare(mime: null | string, targetMimeType: string[]): Boolean;
    input: Object | File | Uint8Array;
    ext: null | string;
    mime: null | string;
    realExt: null | string;
    realMime: null | string;
    constructor(input: any);
    init(callback: Function): void;
    isType(targetMimeType: string, compareType: Number): Boolean;
    isType(targetMimeType: string[], compareType: Number): Boolean;
}
export { TypeFile, browserMimeMapping, realExtMapping, realMimeMapping };
