/**
 * @file 简单的公共数据模块，内部模块之间数据交换
 * @author kaivean
 */

const data = {} as any;

export function setData(key: string, value: any) {
    data[key] = value;
}

export function getData(key: string) {
    return data[key];
}
