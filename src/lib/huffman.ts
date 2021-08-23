/**
 * @file Huffman
 * @author kaivean
 */

/**
 *
 赫夫曼编码
 基本介绍

    1.赫夫曼编码也翻译为    哈夫曼编码(Huffman Coding)，又称霍夫曼编码，是一种编码方式, 属于一种程序算法
    赫夫曼编码是赫哈夫曼树在电讯通信中的经典的应用之一。

    2.赫夫曼编码广泛地用于数据文件压缩。其压缩率通常在20%～90%之间
    赫夫曼码是可变字长编码(VLC)的一种。Huffman于1952年提出一种编码方法，称之为最佳编码

 *
 *
 */

class HuffmanNode {
    data;// 存放数据(字符本身),比如 'a' => 97, ' '=>32
    weight;// 权值，表示字符串出现的次数
    left: HuffmanNode;
    right: HuffmanNode;
    constructor(data: any, weight: number) {
        this.data = data;
        this.weight = weight;
    }

    // 前序遍历
    preOrder(arr: any) {
        arr.push(this);
        if (this.left) {
            this.left.preOrder(arr);
        }
        if (this.right) {
            this.right.preOrder(arr);
        }
    }
}


/**
 *
 * @param {接受字符数组} bytes
 * @return 返回的就是list形式
 */
function getNodes(bytes: Array<any>): HuffmanNode[] {
    //创建一个list
    let list: HuffmanNode[] = [];
    //counts 统计每一个byte出现的次数
    let counts: any = {};
    for (let b of bytes) {
        let count = counts[b]; // map还没有这个字符数据
        if (count == null) {
            counts[b] = 1;
        } else {
            counts[b]++;
        }
    }

    for (const [key, value] of Object.entries(counts)) {
        list.push(new HuffmanNode(key, value as number));
    }
    return list;
}


// 通过list创建赫夫曼树
function createHuffmanTree(nodes: HuffmanNode[]): HuffmanNode | undefined {
    const compareFun = function (a: HuffmanNode, b: HuffmanNode) {
        return a.weight - b.weight;
    };
    while (nodes.length > 1) {
        // 排序,从小到大
        nodes.sort(compareFun);
        // 取出第一颗最小的二叉树
        let leftNode = nodes.shift();
        let rightNode = nodes.shift();
        if (leftNode && rightNode) {
            // 创建一个新的二叉树，它的根节点，没有data，只有权值
            let parent = new HuffmanNode(null, leftNode.weight + rightNode.weight);
            parent.left = leftNode;
            parent.right = rightNode;

            //将新的二叉树，加入到nodes
            nodes.unshift(parent);
        }

    }
    // nodes最后的节点，就是根节点
    return nodes.shift();
}

// 生成赫夫曼树对应的赫夫曼编码表
function getHuffmanCodes(root: any) {
    if (root == null) {
        return null;
    }
    //生成赫夫曼树对应的赫夫曼编码表
    //思路
    //1.将赫夫曼编码表存放在map里面
    //2.在生成赫夫曼编码表时，需要拼接路径，定义一个数组string,存储某个叶子节点的路径

    let huffmanCodes: any = {};
    let strings: any[] = [];
    /**
     * 将传入的node节点的所有叶子节点的赫夫曼编码得到，并放入到huffmanCodes集合中
     * @param {传入节点} node
     * @param {路径：左子节点是0，右子节点是1} code
     * @param {用于拼接路径} string
     */
    function getCodes(node: HuffmanNode, code: string, strs: any[]) {
        let string2 = [...strs];
        // 将code加入到string中
        string2.push(code);
        if (node != null) { // 如果node == null不处理
            // 判断当前node是叶子节点还是非叶子节点
            if (node.data == null) {//非叶子节点
                // 递归处理
                // 向左递归
                getCodes(node.left, '0', string2);
                // 向右递归
                getCodes(node.right, '1', string2)
            } else {//说明是一个叶子节点
                // 就表示找到了某个叶子节点的最后
                huffmanCodes[node.data] = string2.join('');
            }
        }
    }
    getCodes(root, "", strings);
    return huffmanCodes;
}

//编写一个方法，将字符串对应的bytes数组，通过生成的赫夫曼编码表，返回一个赫夫曼编码压缩后的byte数组
/**
 *
 * @param {原始的字符串对应的bytes数组} bytes
 * @param {生成的赫夫曼编码表} huffmanCodes
 * @return 返回的是字符串对应的一个byte数组
 */
function zip(bytes: Array<number>, huffmanCodes: any) {
    //1.利用huffmanCodes将bytes转成赫夫曼编码对应的字符串
    let string = [];
    //遍历数组
    for (let b of bytes) {
        string.push(huffmanCodes[b]);
    }
    return string;
}

function huffstringToByte(strs: Array<string>) {
    //计算赫夫曼编码字符串的长度
    let str = strs.join('');
    let len = Math.ceil(str.length / 8);
    //创建存储压缩后的byte数组
    let huffmanCodeByte = new Array(len + 1);
    let index = 0;
    let strByte: string = ''; // 记录是第几个byte
    for (let i = 0; i < str.length; i += 8) {
        strByte = str.substring(i, i + 8);
        // 将strByte转成一个byte，放入huffmanCodeByte
        huffmanCodeByte[index] = parseInt(strByte, 2);
        index++;
    }
    // 记录最后一位二进制码的长度，因为，比如最后一位二进制strByte为00101时，
    // parseInt(strByte, 2)后等于5，前面的两个00已经丢失，所以必须记录长度，以便解码时补足前面的0
    huffmanCodeByte[index] = strByte.length;
    return huffmanCodeByte;
}

// 使用一个方法，封装前面的方法，便于调用
/**
 *
 * @param {原始的字符串对应的字节数组} bytes
 * @returns 是经过赫夫曼编码处理后，压缩后的字节数组
 *
 */
function huffmanZip(bytes: Array<any>) {
    // 1.生成节点数组
    let nodes = getNodes(bytes);
    // 2.根据节点数组创建赫夫曼树
    let root = createHuffmanTree(nodes);
    // 3.根据赫夫曼树生成赫夫曼编码
    let hufumanCodes = getHuffmanCodes(root);
    // 4.根据生成的赫夫曼编码生成压缩后的赫夫曼编码字节数组
    let hufumanStrArr = zip(bytes, hufumanCodes);
    let hufumanByteArr = huffstringToByte(hufumanStrArr);

    return {result: hufumanByteArr, codes: hufumanCodes};
}

// 完成数据的解压
// 思路
// 1.将huffmanBytesArr先转成赫夫曼编码对应的二进制字符串
// 2.将赫夫曼编码对应的二进制的字符串转成赫夫曼编码字符串

/**
 *
 * @param {表示是否需要补高位，如果是true，表示需要，如果是false，表示不需要，如果是最后一个字节不需要补高位} flag
 * @param {传入的byte} byte
 * @returns 是byte对应的二进制字符串
 */
function heffmanByteToString(flag: boolean, byte: number) {
    //如果是
    if (flag) {
        byte |= 256;
    }
    let str = Number(byte).toString(2)
    if (flag) {
        return str.substring(str.length - 8);
    } else {
        return str;
    }
}

//编写一份方法，完成对压缩数据的解码
/**
 *
 * @param {赫夫曼编码表} huffmanCodes
 * @param {赫夫曼编码得到的二进制数组} huffmanBytes
 */
function decode(huffmanCodes: {[key:string]: string}, huffmanBytes: Array<number>) {
    //1.先得到二进制字符串 形式11001111111011......
    let heffmanStrArr = [];
    for (let i = 0; i < huffmanBytes.length - 1; i++) {
        //判断是不是最后一个字节
        let flag = (i !== huffmanBytes.length - 2);
        heffmanStrArr.push(heffmanByteToString(flag, huffmanBytes[i]))
    }
    //最后一位记录的是最后一位二进制字符串的长度，该长度主要用于补足最后一位丢失的0,所以要单独处理，
    let lastByteStr = heffmanStrArr[heffmanStrArr.length - 1];
    let lastByteLength = huffmanBytes[huffmanBytes.length - 1];
    lastByteStr = '00000000'.substring(8 - (lastByteLength - lastByteStr.length)) + lastByteStr;
    heffmanStrArr[heffmanStrArr.length - 1] = lastByteStr;

    //把赫夫曼编码表进行调换
    let map: {[key:string]: string} = {};
    for (const [key, value] of Object.entries(huffmanCodes)) {
        map[value] = key;
    }

    let heffmanStr = heffmanStrArr.join('');
    let list = [];
    //
    for (let i = 0; i < heffmanStr.length;) {
        let count = 1;
        let flag = true;
        let b: string | null = null;
        while (flag) {
            //取出一个1或0
            //i不动，count移动，直到匹配到一个字符
            let key = heffmanStr.substring(i, i + count);
            b = map[key];
            if (!b) {//没有匹配到
                count++;
            } else {
                //匹配到
                flag = false;
            }
        }
        list.push(parseInt(b as string));
        i += count;
    }
    // 当for循环结束后，list中就存放了所有的字符

    return list;
}


// js byte[] 和string 相互转换 UTF-8
function stringToByte(str: string): Array<number> {
    var bytes = new Array();
    var len, c;
    len = str.length;
    for (var i = 0; i < len; i++) {
        c = str.charCodeAt(i);
        if (c >= 0x010000 && c <= 0x10FFFF) {
            bytes.push(((c >> 18) & 0x07) | 0xF0);
            bytes.push(((c >> 12) & 0x3F) | 0x80);
            bytes.push(((c >> 6) & 0x3F) | 0x80);
            bytes.push((c & 0x3F) | 0x80);
        } else if (c >= 0x000800 && c <= 0x00FFFF) {
            bytes.push(((c >> 12) & 0x0F) | 0xE0);
            bytes.push(((c >> 6) & 0x3F) | 0x80);
            bytes.push((c & 0x3F) | 0x80);
        } else if (c >= 0x000080 && c <= 0x0007FF) {
            bytes.push(((c >> 6) & 0x1F) | 0xC0);
            bytes.push((c & 0x3F) | 0x80);
        } else {
            bytes.push(c & 0xFF);
        }
    }
    return bytes;
}

function byteToString(arr: Array<number>): string {
    if (typeof arr === 'string') {
        return arr;
    }
    var str = '',
        _arr = arr;
    for (var i = 0; i < _arr.length; i++) {
        var one = _arr[i].toString(2),
            v = one.match(/^1+?(?=0)/);
        if (v && one.length == 8) {
            var bytesLength = v[0].length;
            var store = _arr[i].toString(2).slice(7 - bytesLength);
            for (var st = 1; st < bytesLength; st++) {
                store += _arr[st + i].toString(2).slice(2);
            }
            str += String.fromCharCode(parseInt(store, 2));
            i += bytesLength - 1;
        } else {
            str += String.fromCharCode(_arr[i]);
        }
    }
    return str;
}

export function huffmanEncode(str: string) {
    let bytes = stringToByte(str);
    let {result, codes} = huffmanZip(bytes);
    return {
        codes,
        result: byteToString(result)
    };
}

export function huffmanDecode(codes: any, str: string) {
    let hufumanByteArr = stringToByte(str);
    const oriByte = decode(codes, hufumanByteArr);
    return byteToString(oriByte);
}

// let content = 'i like like like java do you like a java';

// let bytes = stringToByte(content);
// let nodes = getNodes(bytes);
// let root = createHuffmanTree(nodes) as HuffmanNode;
// // console.log('根节点：', root);
// let list: any = [];
// root.preOrder(list);
// // console.log('前序遍历：', list);

// console.log('content长度', content.length);
// console.log('bytes长度', bytes, atob(content), atob(content).length);


// // 测试
// let hufumanCodes = getHuffmanCodes(root);
// console.log('生成的赫夫曼编码表：', hufumanCodes);

// // 生成赫夫曼编码字符串
// let hufumanStrArr = zip(bytes, hufumanCodes);
// console.log('赫夫曼编码字符串：', hufumanStrArr.join(''))
// console.log('赫夫曼编码字符串的长度：', hufumanStrArr.join('').length)//应该是133

// // 将生成赫夫曼编码字符串转成字节数组, 要发送的数组
// let hufumanByteArr = huffstringToByte(hufumanStrArr);//长度为17
// console.log('压缩后的字节数组', hufumanByteArr);
// console.log('压缩率：', (bytes.length - hufumanByteArr.length) / bytes.length * 100 + '%');

// // 测试封装后的方法
// console.log('压缩后的字节数组', huffmanZip(bytes));

// // 测试解码
// console.log('解码后的的：', decode(hufumanCodes, hufumanByteArr));
// console.log('原字符数组：', bytes);
// console.log('解码后字符串：', byteToString(decode(hufumanCodes, hufumanByteArr)));
// console.log('原先的字符串：', byteToString(bytes));
// console.log('原先的字符串：', byteToString(hufumanByteArr).length);
// console.log('原先的字符串：', stringToByte(byteToString(hufumanByteArr)));
