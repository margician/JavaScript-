// aHR0cHM6Ly96d2Z3Lm1jdC5nb3YuY24vd3ljeC93eGpseWZkLw==
// 解密算法代码


const stringToArray = (str) => {
    if (!/string/gi.test(Object.prototype.toString.call(str))) {
        str = JSON.stringify(str);
    }
    return unescape(encodeURIComponent(str)).split("").map(val => val.charCodeAt());
}
const tTransform2 = (ka) => {
    let bb = 0;
    let rk = 0;
    const b = [4];
    const a = PUT_ULONG_BE(ka, 0);

    b[0] = sm4Sbox(a[0]);
    b[1] = sm4Sbox(a[1]);
    b[2] = sm4Sbox(a[2]);
    b[3] = sm4Sbox(a[3]);
    bb = GET_ULONG_BE(b, 0);
    rk = bb ^ ROTL(bb, 13) ^ ROTL(bb, 23);
    return rk;
}

const sm4Sbox = (inch) => {
    let i = inch & 255;
    let retVal = Sbox[i];
    return retVal;
}
const SHL = (x, n) => {
    return (x & -1) << n;
}
const ROTL = (x, n) => {
    return SHL(x, n) | x >> 32 - n;
}
const sm4Lt = (ka) => {
    let bb = 0;
    let c = 0;
    const b = [4];
    const a = PUT_ULONG_BE(ka, 0);
    b[0] = sm4Sbox(a[0]);
    b[1] = sm4Sbox(a[1]);
    b[2] = sm4Sbox(a[2]);
    b[3] = sm4Sbox(a[3]);
    bb = GET_ULONG_BE(b, 0);
    c = bb ^ ROTL(bb, 2) ^ ROTL(bb, 10) ^ ROTL(bb, 18) ^ ROTL(bb, 24);

    return c;
}
const sm4F = (x0, x1, x2, x3, rk) => {
    return x0 ^ sm4Lt(x1 ^ x2 ^ x3 ^ rk);
}
const GET_ULONG_BE = (b, i) => {
    let n = (b[i] & 255) << 24 | (b[i + 1] & 255) << 16 | (b[i + 2] & 255) << 8 | b[i + 3] & 255 & -1;
    return n;
}
const PUT_ULONG_BE = (n, i) => {
    let b = new Array(4).fill(0); // 创建一个长度为 5 的数组并初始化为 0

    // 使用位运算提取每个字节
    b[0] = (n >> 24) & 0xFF; // 提取最高有效字节
    b[1] = (n >> 16) & 0xFF; // 提取次高有效字节
    b[2] = (n >> 8) & 0xFF;  // 提取次低有效字节
    b[3] = n & 0xFF;         // 提取最低有效字节

    // 将每个元素转为有符号的 byte 值
    for (let i = 0; i < b.length; i++) {
        if (b[i] > 127) {
            b[i] -= 256; // 处理从 128 到 255 的值，使其变为 -128 到 -1
        }
    }
    return b
}
const sm4_one_round = (sk, input) => {
    let i = 0;
    const ulbuf = new Array(36).fill(0);
    ulbuf[0] = GET_ULONG_BE(input, 0);
    ulbuf[1] = GET_ULONG_BE(input, 4);
    ulbuf[2] = GET_ULONG_BE(input, 8);

    for (ulbuf[3] = GET_ULONG_BE(input, 12); i < 32; ++i) {
        ulbuf[i + 4] = sm4F(ulbuf[i], ulbuf[i + 1], ulbuf[i + 2], ulbuf[i + 3], sk[i]);
    }
    const byteArrays = [];
    byteArrays.push(PUT_ULONG_BE(ulbuf[35], 0));
    byteArrays.push(PUT_ULONG_BE(ulbuf[34], 4));
    byteArrays.push(PUT_ULONG_BE(ulbuf[33], 8));
    byteArrays.push(PUT_ULONG_BE(ulbuf[32], 12));
    // 初始化一个空数组，用于存储每次调用的结果
    const combinedArray = [];

    // 调用函数四次，收集每次返回的数组
    for (let i = 0; i < byteArrays.length; i++) {
        const array = byteArrays[i];
        combinedArray.push(...array); // 使用扩展运算符将当前数组元素添加到合并数组中
    }

    return combinedArray;

}

const dePadding = (paddedBuffer) => {
    if (paddedBuffer === null) {
        return null;
    }
    let paddingLength = paddedBuffer[paddedBuffer.length - 1];
    let originalBuffer = paddedBuffer.slice(0, paddedBuffer.length - paddingLength);
    return originalBuffer;
}

const UINT8_BLOCK = 16;
const Sbox = [
    -42, -112, -23, -2, -52, -31, 61, -73, 22, -74, 20, -62, 40, -5, 44, 5, 43, 103, -102, 118, 42, -66, 4, -61, -86, 68, 19, 38, 73, -122, 6, -103, -100, 66, 80, -12, -111, -17, -104, 122, 51, 84, 11, 67, -19, -49, -84, 98, -28, -77, 28, -87, -55, 8, -24, -107, -128, -33, -108, -6, 117, -113, 63, -90, 71, 7, -89, -4, -13, 115, 23, -70, -125, 89, 60, 25, -26, -123, 79, -88, 104, 107, -127, -78, 113, 100, -38, -117, -8, -21, 15, 75, 112, 86, -99, 53, 30, 36, 14, 94, 99, 88, -47, -94, 37, 34, 124, 59, 1, 33, 120, -121, -44, 0, 70, 87, -97, -45, 39, 82, 76, 54, 2, -25, -96, -60, -56, -98, -22, -65, -118, -46, 64, -57, 56, -75, -93, -9, -14, -50, -7, 97, 21, -95, -32, -82, 93, -92, -101, 52, 26, 85, -83, -109, 50, 48, -11, -116, -79, -29, 29, -10, -30, 46, -126, 102, -54, 96, -64, 41, 35, -85, 13, 83, 78, 111, -43, -37, 55, 69, -34, -3, -114, 47, 3, -1, 106, 114, 109, 108, 91, 81, -115, 27, -81, -110, -69, -35, -68, 127, 17, -39, 92, 65, 31, 16, 90, -40, 10, -63, 49, -120, -91, -51, 123, -67, 45, 116, -48, 18, -72, -27, -76, -80, -119, 105, -105, 74, 12, -106, 119, 126, 101, -71, -15, 9, -59, 110, -58, -124, 24, -16, 125, -20, 58, -36, 77, 32, 121, -18, 95, 62, -41, -53, 57, 72
];
const CK = [
    462357, 472066609, 943670861, 1415275113, 1886879365, -1936483679, -1464879427, -993275175, -521670923, -66909679, 404694573, 876298825, 1347903077, 1819507329, -2003855715, -1532251463, -1060647211, -589042959, -117504499, 337322537, 808926789, 1280531041, 1752135293, -2071227751, -1599623499, -1128019247, -656414995, -184876535, 269950501, 741554753, 1213159005, 1684763257
];
const FK = [
    -1548633402, 1453994832, 1736282519, -1301273892
];
const check = (name, str) => {
    if (!str || str.length != 16) {
        console.error(`${name} should be a 16 bytes string.`);
        return false;
    }
    return true;
}

function isNotBlank(str) {
    return str !== null && str.trim() !== '';
}

const EncryptRoundKeys = (key) => {
    const keys = [];
    const mk = [
        (key[0] & 255) << 24 | (key[1] & 255) << 16 | (key[2] & 255) << 8 | key[3] & 255 & -1,
        (key[4] & 255) << 24 | (key[5] & 255) << 16 | (key[6] & 255) << 8 | key[7] & 255 & -1,
        (key[8] & 255) << 24 | (key[9] & 255) << 16 | (key[10] & 255) << 8 | key[11] & 255 & -1,
        (key[12] & 255) << 24 | (key[13] & 255) << 16 | (key[14] & 255) << 8 | key[15] & 255 & -1,
    ];

    let k = new Array(36);
    k[0] = mk[0] ^ FK[0];
    k[1] = mk[1] ^ FK[1];
    k[2] = mk[2] ^ FK[2];

    let i = 0;
    for (k[3] = mk[3] ^ FK[3]; i < 32; i++) {
        k[i + 4] = k[i] ^ tTransform2(k[i + 1] ^ k[i + 2] ^ k[i + 3] ^ CK[i]);
        keys[i] = k[i + 4];
    }

    return keys;
}
const decrypt_ecb = (ciphertext, key, mode = "base64") => {
    if (!check("key", key)) {
        return;
    }
    if (isNotBlank(ciphertext)) {
        ciphertext = ciphertext.replaceAll(/@/g, "+");
        ciphertext = ciphertext.replaceAll(/#/g, "\r");
        ciphertext = ciphertext.replaceAll(/!/g, "\n");
    }
    // get cipher byte array
    let decryptRoundKeys = EncryptRoundKeys(stringToArray(key)).reverse();
    let cipherByteArray = null;
    if (mode === 'base64') {
        // cipher is base64 string
        // cipherByteArray = base64js.toByteArray(ciphertext);
        // 解码 Base64 字符串
        const decodedString = atob(ciphertext);

        // 将解码后的字符串转换回字节数组
        cipherByteArray = new Uint8Array(decodedString.length);
        for (let i = 0; i < decodedString.length; i++) {
            cipherByteArray[i] = decodedString.charCodeAt(i);
        }

    } else {
        // cipher is text
        cipherByteArray = stringToArray(ciphertext);
    }
    let blockTimes = cipherByteArray.length / UINT8_BLOCK;
    const outArray = [];

    for (let i = 1; i <= blockTimes; i++) {
        // extract the 16 bytes block data for this round to encrypt
        let roundIndex = i * UINT8_BLOCK;
        const array = sm4_one_round(decryptRoundKeys, cipherByteArray.slice(roundIndex - 16, roundIndex));
        outArray.push(...array);

    }


    // depadding the decrypted data
    let depaddedPlaintext = dePadding(outArray);
    return bytesToString(depaddedPlaintext);
}

function bytesToString(bytes) {
    const textDecoder = new TextDecoder('utf-8');
    return textDecoder.decode(new Uint8Array(bytes));
}

const padding = (originalBuffer) => {
    if (originalBuffer === null) {
        return null;
    }
    let paddingLength = UINT8_BLOCK - originalBuffer.length % UINT8_BLOCK;
    let paddedBuffer = new Array(originalBuffer.length + paddingLength);

    originalBuffer.forEach((val, index) => paddedBuffer[index] = val);
    paddedBuffer.fill(paddingLength, originalBuffer.length);
    return paddedBuffer;
}

const encrypt_ecb = (plaintext, key, mode = "base64") => {
    //console.log(plaintext, key)
    if (!check("key", key)) {
        return;
    }

    let encryptRoundKeys = EncryptRoundKeys(stringToArray(key));
    // let plainByteArray = stringToArray(JSON.stringify(plaintext));
    let plainByteArray = stringToArray(plaintext);
    let padded = padding(plainByteArray);
    let blockTimes = padded.length / UINT8_BLOCK;

    // 初始化一个空数组，用于存储每次调用的结果
    const outArray = [];
    for (let i = 1; i <= blockTimes; i++) {
        // extract the 16 bytes block data for this round to encrypt
        let roundIndex = i * UINT8_BLOCK;
        const array = sm4_one_round(encryptRoundKeys, padded.slice(roundIndex - 16, roundIndex));
        outArray.push(...array);

    }

    // cipher array to string
    if (mode === 'base64') {
        // return base64js.fromByteArray(outArray);
        let cipherText = btoa(String.fromCharCode.apply(null, new Uint8Array(outArray)))
        if (isNotBlank(cipherText)) {
            cipherText = cipherText.replaceAll(/\+/g, "@");
            cipherText = cipherText.replaceAll(/\r/g, "#");
            cipherText = cipherText.replaceAll(/\n/g, "!");
        }
        return cipherText;
    } else {
        // text
        return decodeURIComponent(escape(String.fromCharCode(...outArray)));
    }
}


key = "1036d2e87fa24af0"
// t = "1HCALSf@iYd74bDy5CEXVAiJLCgsEgT4lFRz925vXSEm1o7u0ZS07aGBdJY/9EiLMBny9VpLex6tdVLwP@oOQhlLlo05Kb40UJVPrjVEVTLYjGeSkwEdU5rZ0dgYs4rvOHyaFK@3wzeyS55DEsm8Ie3SwBCUXXzSJO21SsZRHKHXyldYtX0W0hzT7r4tusn1V/pPiPSBIAzmzWrZ9evTlWztKj3cfMQzoT6IcEoUzRMBwE9ilMFzd9y9Z16C8/HzdwjfFWEQ2mnCPXKkQia8ITGZtvR@o3dKsdUV2bzfp/sg2I3V85XU1/LUrlUGoByc2zTo1dN8mfge/EST5/OQnHIx44F8hspPNKJYo49nHOvVaeoz@KCkuCPO9y@MmtaDg1NHQpuqODiz/GPRldDTPjRLTTRUKkTVGEQk90JkY8e2EDc8kNTG8NxOb27uI1oQrnsKE5kSTJvEvLGOFmZrd3AMkI2MK1H08x1Pqy0udf860Os88Fhf2Qa4zGL714lDR5YnPp/iNS6BqaLfJ0NwyX7c5eeMjMP3zYaZqmxF9ZzHHKVUTm13HOosqfSEgVbjZgqJ0s/7fJPJs@UHXsxI1q2ZuOTsp6YkuE11wGbChGoGEQPR/FxPirWgwRwPor2o4n9fIqrZ2OUH263DW17zm7JIe1jSVg8Ywd9y/wntGmdknry5OGIKZxj@QwwXRJUziZoBC4LSu@1nOxaeIM/YQffTDTOiRn7APhdpI2TTCfV@4QXl8CKkAiCjYvGjFy86ab3Ovy9QFTqMCQ6h8vintSzyCaLO0UaiuZQisjGzlX9hF0aTh@Npnk4W7XQdrVukegp6wVsV9kcmTVqKIRrkpyEcuscXMBF1llILLsHMz5HRes9bieMAql70GarR5y7aEi9RmDV@tednPNlFUBYMjq1kVcjboUioozNTrYcir0mYc/WSUOS@@wzdh8bUA2KoeNU3@i/0e/DVlgGe436zlD6MZ/Be27C2wGmIZhDG6l3f623pizrJkxbWLAmNCXSWBUGWsSLD2t0sjT983FT1mrwvdQdw2@En5MnE7fpA2GLS2BIFdzoxYhncG4L4UUUfEGtUaOyLa@NDRt/E9WRVnBIvUZg1frXnZzzZRVAWDI5MXZov8PmvRPBVkrlwjIeNmHP1klDkvvsM3YfG1ANiqDzbSOevZw1SOqF2pthdXhQGEQPR/FxPirWgwRwPor2o4n9fIqrZ2OUH263DW17zmwzZ@4mwg8kMwfm/@vSRN9hWUSXDCHH@O9o/20wUJO9qBUiQ40t1TR4pWhX/zjVIQIgvroJerfJzLn6mypXjlaFBw85CKiLdQpjalNGzURkp8cuCTxK6GZvwRisk/8ZB8fVY/rT6XxalMlhML9wbG3uJmgELgtK77Wc7Fp4gz9hB99MNM6JGfsA@F2kjZNMJ9XxE1A1ErD2ok2MGNtqNflKjfHcb8MNM@1Y0KM2pl9o/kelf25P0kQjvY84qsqDvjQHAT2KUwXN33L1nXoLz8fNOMJkLHTJsqXcmISc9DGAMv1p4axbSdqsGovuMpE9TuQ=="
t = "4kG2xZJe3NgMFe5RP1YYmNIJmhLpGT9CeclyDJHLfSi4kk9E38HCmypxOhWIbddRiobWomlhdaXAZGAPalUpbg=="
// {"pageSize":"15","pageNum":"1","hotelName":"","province":""}
jg = decrypt_ecb(t, key)
console.log(jg)

console.log(encrypt_ecb(jg, key))


// 获取key的内容
// headers = {
//     'referer': 'https://zwfw.mct.gov.cn/wycx/wxjlyfd/',
//     'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36'
// }
// r = reqests.post('https://zwfw.mct.gov.cn/portal/getsm4key')
