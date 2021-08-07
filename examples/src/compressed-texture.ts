// import { Game, GameObject, resource, RESOURCE_TYPE } from "../../packages/eva.js/lib";
// import { INTERNAL_FORMATS, RendererSystem } from "../../packages/plugin-renderer/lib";
// import { Img, ImgSystem } from "../../packages/plugin-renderer-img/lib";
// import { useCompressedTexture } from "../../packages/plugin-renderer/lib";

// export const name = 'compressed-textures';

// export async function init(canvas: HTMLCanvasElement) {
//   useCompressedTexture(resource);
//   resource.addResource([
//     {
//       name: 'imageName',
//       type: RESOURCE_TYPE.IMAGE,
//       src: {
//         image: {
//           type: 'png',
//           url: './person.png',
//           texture: [{
//             type: 'etc',
//             internalFormat: INTERNAL_FORMATS.COMPRESSED_RGBA_ASTC_4x4_KHR,
//             url: './person.etc.ktx'
//           }, {
//             type: 'astc',
//             internalFormat: INTERNAL_FORMATS.COMPRESSED_RGBA_ASTC_4x4_KHR,
//             url: './person.astc.ktx'
//           }, {
//             type: 's3tc',
//             internalFormat: INTERNAL_FORMATS.COMPRESSED_RGBA_S3TC_DXT5_EXT,
//             url: './person.s3tc.ktx'
//           },]
//         },
//       },
//       preload: false,
//     },
//   ]);
//   const game = new Game({
//     systems: [
//       new RendererSystem({
//         canvas,
//         width: window.innerWidth,
//         height: window.innerHeight,
//         backgroundColor: '0xff0000',
//         useCompressedTexture: true
//       }),
//       new ImgSystem(),
//     ],
//   });
//   // const res = await resource.getResource('imageName');
//   const image = new GameObject('image', {
//     size: { width: window.innerWidth, height: window.innerWidth },
//     origin: { x: 0, y: 0 },
//     position: {
//       x: 0,
//       y: 0,
//     },
//     anchor: {
//       x: 0,
//       y: 0,
//     },
//   });
//   //@ts-ignore
//   const img = new Img({
//     resource: 'imageName',
//   });
//   image.addComponent(
//     ///@ts-ignore
//     img,
//   );

//   game.scene.addChild(image);
// }