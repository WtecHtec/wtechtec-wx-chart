class DrawUtil {
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
   * @param {*} config  配置画笔
   */
  drawLineVertical(x1, x2, top = 0, left = 0, config = {}) {

    let ctx = this.ctx
    ctx.restore()
    ctx.setLineWidth(0.05)
    ctx.beginPath();
    ctx.moveTo(x1 + left, top);
    ctx.lineTo(x2 + left, top);
    ctx.closePath();
    ctx.stroke();
    ctx.restore()

  }
  // 绘制 水平线
  /**
   * 
   * @param {*} x1  最上边
   * @param {*} x2 最下边
   * @param {*} top 距离上方
   * @param {*} left 距离左方
   * @param {*} config  配置画笔
   */
  drawLineHorizontal(y1, y2, top = 0, left = 0, config = {}) {

    let ctx = this.ctx
    ctx.restore()
    ctx.beginPath();
    ctx.moveTo(left, y1 + top);
    ctx.lineTo(left, y2 + top);
    ctx.closePath();
    ctx.setStrokeStyle(config.strokeStyle || '#000')
    ctx.stroke();
    ctx.restore()

  }

  // 绘制文字
  /**
   * 
   * @param {*} text 内容 
   * @param {*} x  坐标 x
   * @param {*} y  坐标 y
   * config: 画笔配置
   */
  drawWord(text, x, y, config = {}) {

    let ctx = this.ctx
    ctx.restore()
    ctx.setTextAlign(config.textAlign || '')
    ctx.setFillStyle('#000')
    ctx.fillText(text, x, y);
    ctx.restore()
  }

  // 绘制矩形
  /**
   * 
   * @param {*} x  X坐标
   * @param {*} y  y坐标
   * @param {*} w  宽度
   * @param {*} h  高度
   * @param {*} config  配置
   * 
   * ['#7587DB', '#FFAA00', '#00C5DC']
   */
  drawRect(x, y, w, h, config = {}) {
    let ctx = this.ctx
    ctx.restore()
    ctx.setFillStyle(config.fillColor || '#7587DB')
    ctx.fillRect(x, y, w, h);
    ctx.restore()
  }

  /**
   * 
   * @param {*} x  x坐标
   * @param {*} y  y坐标
   * @param {*} r  半径
   * @param {*} sa 开始角度
   * @param {*} ea 结束角度
   * @param {*} ishollow  是否空心
   * @param {*} config 画笔配置
   */
  drawArc(x, y, r, sa, ea, ishollow, config = {}) {
    let ctx = this.ctx
    ctx.restore()
    ctx.beginPath()
    ctx.arc(x, y, r, sa, ea)
    if (ishollow) {
      ctx.setLineWidth(config.lineWidth || 1)
      config.strokeStyle && ctx.setStrokeStyle(config.strokeStyle || '#000')
      ctx.stroke();
    } else {
      config.fillStyle && ctx.setFillStyle(config.fillStyle || '#000')
      ctx.fill()
    }
    // ctx.restore()
    // ctx.stroke()
  }

  /**
   * 
   * @param {*} pos1  {x , y} 坐标对象
   * @param {*} pos2  {x, y}  坐标对象
   * @param {*} config  画笔配置
   */
  drawLine(pos1, pos2, config = {}) {
    let ctx = this.ctx
    ctx.restore()
    ctx.beginPath();
    ctx.moveTo(pos1.x, pos1.y);
    ctx.lineTo(pos2.x, pos2.y);
    ctx.closePath();
    config.fillStyle && ctx.setFillStyle(config.fillStyle || '#7587DB')
    config.strokeStyle && ctx.setStrokeStyle(config.strokeStyle || '#7587DB')
    // console.log('config.fillStyle', config.fillStyle)
    ctx.setLineWidth(config.lineWidth || 1)
    ctx.stroke();
    ctx.fill()

    // ctx.restore()
  }

  /**
   *  绘制区域
   * @param {*} startPos  绘制开始点
   * @param {*} pos  绘制点数组
   * @param {*} config  画笔配置
   */
  drawArea(startPos, pos, isFll, config = {}) {
    let ctx = this.ctx
    ctx.restore()
    ctx.beginPath();
    ctx.moveTo(startPos.x, startPos.y);
    for (let i = 0; i < pos.length; i++) {
      ctx.lineTo(pos[i].x, pos[i].y);
    }
    ctx.closePath();

    ctx.setLineWidth(config.lineWidth || 1)
    if (isFll) {
      config.fillStyle && ctx.setFillStyle(config.fillStyle || '#7587DB')
      ctx.fill()
    } else {
      config.strokeStyle && ctx.setStrokeStyle(config.strokeStyle || '#7587DB')
      ctx.stroke();
    }
    ctx.restore()
  }
}
export default DrawUtil;