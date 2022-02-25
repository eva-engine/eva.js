
	export class GLHook {
		
		public drawPasses:number = 0;
		public isInit:boolean = false;
		private realGLDrawElements:Function = function(){};

		private gl:any;
		
		constructor(_gl?:any) {	

			if(_gl){
				
				if(_gl.__proto__.drawElements){
					this.gl = _gl;
					this.realGLDrawElements = _gl.__proto__.drawElements;
					
					//replace to new function
					_gl.__proto__.drawElements = this.fakeGLdrawElements.bind(this);
					this.isInit = true;

					// console.log("[GLHook] GL was Hooked!");
				}

			} else {
				console.error("[GLHook] GL can't be NULL");
			}
		}

		private fakeGLdrawElements(mode:any, count:any, type:any, offset:any):void {

			this.drawPasses ++;
			this.realGLDrawElements.call(this.gl, mode, count, type, offset);
		
		}
		public reset():void{
		
			this.drawPasses = 0;
		
		}

		public release():void{

			if(this.isInit){
				
				this.gl.__proto__.drawElements = this.realGLDrawElements;
				// console.log("[GLHook] Hook was removed!");
			}

			this.isInit = false;
		}
	}
