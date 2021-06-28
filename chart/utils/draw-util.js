class DrawUtil{
    constructor(ctx) {
        try {
            if (!(ctx)) throw '画布实例对象错误！'
            this.ctx = ctx
        } catch (e) {
            console.error(e)
        }
    }
    // 绘制 垂直线
    /**
     * 
     * @param {*} x1  最左边
     * @param {*} x2 最右边
     * @param {*} top 距离上方
     * @param {*} left 距离左方
     * @param {*} config  配置画笔颜色
     */
    drawLineVertical(x1,x2, top=0, left=0, config={}) {
        let ctx = this.ctx
		ctx.lineWidth  = 1
		// ctx.strokeWidth = 0.2
		// ctx.strokeStyle="#FF0000";
        ctx.beginPath();
        ctx.moveTo(x1 + left, top);
        ctx.lineTo(x2 + left, top);
        // ctx.closePath();
        // ctx.stroke();
        // ctx.fill();
        ctx.stroke();
    }
   // 绘制 水平线
    drawLineHorizontal(y1,y2, top=0, left=0,config={}) {
        let ctx = this.ctx
        ctx.beginPath();
        ctx.moveTo(left, y1 + top);
        ctx.lineTo(left, y2 + top);
        ctx.closePath();
        ctx.stroke();
    }
	
    // 绘制文字
    /**
     * 
     * @param {*} text 内容 
     * @param {*} x  坐标 x
     * @param {*} y  坐标 y
     */
	drawWord(text, x, y){
		let ctx = this.ctx
		ctx.fillText(text, x, y);
	}
	
	// 绘制矩形
	drawRect(x,y,w,h,config={}) {
		let ctx = this.ctx
		ctx.fillStyle= config.fillStyle || "#7B68EE";
		ctx.fillRect(x,y,w,h);
	}
	
}
export default DrawUtil;