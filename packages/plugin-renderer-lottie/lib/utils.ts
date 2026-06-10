import iOSVersion from 'ios-version';

const getIOSMajor = () => {
  const userAgent = globalThis.navigator?.userAgent || '';
  return iOSVersion(userAgent)?.major;
};

const dataURL2blob = (dataURL: string) => {
  const binaryString = atob(dataURL.split(',')[1]);
  const arrayBuffer = new ArrayBuffer(binaryString.length);
  const intArray = new Uint8Array(arrayBuffer);
  const mime = dataURL.split(',')[0].match(/:(.*?);/)?.[1] || 'image/png';
  for (let i = 0, j = binaryString.length; i < j; i++) {
    intArray[i] = binaryString.charCodeAt(i);
  }
  return new Blob([intArray], { type: mime });
};

const dataURL2ObjUrl = (dataURL: string) => {
  const urlFactory = globalThis.URL || window.webkitURL;
  if (urlFactory?.createObjectURL) {
    return urlFactory.createObjectURL(dataURL2blob(dataURL));
  }
  return dataURL;
};

export function imageHandle(source: string) {
  const isBase64Reg = /^data:image\/png;base64/;
  const major = getIOSMajor();
  if (major && major <= 8 && isBase64Reg.test(source)) {
    return dataURL2ObjUrl(source);
  }

  return source;
}
