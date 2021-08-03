import { resolve } from "path";
import { defineConfig } from "vite";

export default defineConfig({
  server: {
    open: true,
    port: 8083,
    host: '0.0.0.0',
  },
  publicDir:'./public/',
  base: './',
  root:'./vite-test',
  resolve: {
    alias: [
      {
        find:/@eva\/(.*)/,
        replacement: (()=>{console.log('?');return resolve(__dirname, './packages/$1/lib')})()
      }
    ]
  }
})