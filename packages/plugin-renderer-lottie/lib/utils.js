import iOSVersion from 'ios-version';

const { major } = iOSVersion(window.navigator.userAgent) || {};

/**
 * dataURL 转成 blob
 * @param dataURL
 * @return blob
 */
function dataURL2blob(dataURL) {
  let binaryString = atob(dataURL.split(',')[1]);
  let arrayBuffer = new ArrayBuffer(binaryString.length);
  let intArray = new Uint8Array(arrayBuffer);
  let mime = dataURL.split(',')[0].match(/:(.*?);/)[1]
  for (let i = 0, j = binaryString.length; i < j; i++) {
    intArray[i] = binaryString.charCodeAt(i);
  }
  let data = [intArray];
  let result;
  try {
    result = new Blob(data, { type: mime });
  } catch (error) {
    console.log(error);
  }
  return result;
}

/**
 * 创建新的URL 对象表示指定的 File 对象或 Blob 对象。
 * @param {string} dataURL  base64
 */
function dataURL2ObjUrl(dataURL) {
  window.URL = window.URL || window.webkitURL
  if (window.URL && URL.createObjectURL) {
    // dataURL2blob 此方法需额外定义
    const blob = dataURL2blob(dataURL)
    return URL.createObjectURL(blob)
  }
  return dataURL
}

export function imageHandle(source) {
  // if (!imageHandle.systemOs) {
  //   imageHandle.systemOs = UA().os
  // }
  // const {
  //   version: {
  //     original = ''
  //   },
  //   name = ''
  // } = imageHandle.systemOs;
  // const isBase64Reg = /^data:image\/png;base64/;
  // const isLtiOS10 = name === 'iOS' && (+original.split('.')[0] <= 10)
  if (major <= 8 && isBase64Reg.test(source)) {
    return dataURL2ObjUrl(source);
  }

  return source;
}