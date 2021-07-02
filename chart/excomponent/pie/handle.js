import { CONFIG } from './config'
import DrawUtil  from '../../utils/draw-util'
import ScalePie from '../../scale/scale-pie'
import { COLOR } from '../../utils/color'
class BarHandle {

    constructor(ctx, floatctx, self){
        try {
            if (!(ctx)) throw '画布实例对象错误！'

            this.floatctx = floatctx

            this.$app = self
            this.$app.floatShow = false
            this.$app.floatData = []

            this.ctx = ctx
            this.config = {}

            this.floatdrawUtil =  new DrawUtil(floatctx)
            this.drawUtil =  new DrawUtil(ctx)
         
            this.scalePieDatas = []

            this.currentIndex = -1
            this.currentTapData = []

            this.floatTime = null

            this.radius = 5

            // 外半径
            this.outR = 5

            // 内半径
            this.innerR = 0


            this.centerX = 10
            this.centerY = 10

            this.lineWidth = 0




        } catch (e) {
            console.error(e)
        }
    }

    /**
     *  设置图表数据
     * @param { } config 
     */
    setOption(config) {
        this.config =  Object.assign(CONFIG, config)
  
        this._setRadius()

        this._setPieDatas()

        this._drawPie()
        // this.drawUtil.drawArc(this.centerX, this.centerY, this.outR/2, 0, Math.PI * 2, 0)
        // if (this.config.radius.length >= 2) {
        //     this.drawUtil.drawArc(this.centerX, this.centerY, this.innerR/2, 0, Math.PI * 2, 0, { fillStyle: '#fff' })
        // }
        

        this.drawUtil.ctx.draw()
    }

    /**
     *  获取图表配置
     */
    getOption() {
        return this.config
    }
    
     /**
     *  根据 x 坐标 算出点击的位置
     * @param { } x 
     */
    bindTap(x, y) {
        let isTouch =  this._isInExactPieChartArea(
            {
                x,
                y
            }, 
            {
                x: this.centerX,
                y: this.centerY
            }, 
            this.outR/2)
        if (isTouch) {
            let index = this._findPieChartCurrentIndex(
                {
                    x,
                    y
                }, 
                {
                    x: this.centerX,
                    y: this.centerY
                }, 
            )
            console.log('bindTap', index)
            return this.scalePieDatas[index]
        } 
        
    }
    /**
     *  设置圆半径
     */
    _setRadius(){
        if ( this.config.height < this.config.width) {
            this.radius =  this.config.height - this.config.grid.top - this.config.grid.bottom
            this.centerY =  this.config.grid.top + this.radius/2
            this.centerX = this.config.width / 2
            
        } else {
            this.radius = this.config.width - this.config.grid.left - this.config.grid.right
            this.centerY = this.config.height/2
            this.centerX = this.config.grid.left + this.radius/2
        }
        this.outR = this.radius

        if (!Array.isArray( this.config.radius)) {
            console.error('config.radius 不是一个数组')
            return
        }
    
        if (this.config.radius.length === 1) {
            this.outR  = this.radius * this.config.radius[0]
           
        }
        else if (this.config.radius.length >= 2) {
            console.log( this.radius * this.config.radius[0])
            this.innerR = this.radius * this.config.radius[0]
            this.outR  =   this.innerR + this.radius * ( this.config.radius[1] -  this.config.radius[0] )

        }
    }

    /**
     *  设置饼图数据
     */
    _setPieDatas() {
        if ( !this.config.series) {
            console.error('series 配置错误')
            return
        }
        this.scalePieDatas = new ScalePie().value((item)=> item.value ).getArcs(this.config.series.data)
        
    }
    
    /**
     *  绘制饼图
     */
    _drawPie() {
        let lineWidth = this.outR/2 - this.innerR/2
        let colorLen = COLOR.length
        for(let i = 0; i < this.scalePieDatas.length; i++) {
           console.log('_drawPie',this.scalePieDatas[i] )
            this.drawUtil.drawArc(this.centerX, this.centerY, this.outR/2 - lineWidth/2 , this.scalePieDatas[i].startAngle, this.scalePieDatas[i].endAngle, 1, 
                {   lineWidth,
                    strokeStyle: COLOR[i % colorLen] 
                })
        }
    }

    /**
     *  返回查找点击了数据的索引
     * @param {*} currentPoints   { x,y} 点击事件的x,y坐标
     * 
     * @param {*} center    { x,y} 画圆中心点的x,y坐标
     */
    _findPieChartCurrentIndex(currentPoints, center) {
        var currentIndex = -1;
        var angle = Math.atan2(center.y - currentPoints.y, currentPoints.x - center.x);
        angle = -angle;
        for (var i = 0, len = this.scalePieDatas.length; i < len; i++) {
            var item = this.scalePieDatas[i];
            if (this._isInAngleRange(angle, item.startAngle, item.endAngle)) {
                currentIndex = i;
                break;
            }
        }
        return currentIndex;
    }

    /**
     *  根据勾股定理
     *  判断点击是否在圈内
     * @param { } currentPoints   { x,y} 点击事件的x,y坐标
     * @param {*} center  { x,y} 画圆中心点的x,y坐标
     * @param {*} radius  圆半径
     */
    _isInExactPieChartArea(currentPoints = {}, center = {}, radius) {
        console.log(Math.pow(currentPoints.x - center.x, 2) + Math.pow(currentPoints.y - center.y, 2) )
        return Math.pow(currentPoints.x - center.x, 2) + Math.pow(currentPoints.y - center.y, 2) <= Math.pow(radius, 2);
    }

    /**
     *  角度是否存在某个角度直接
     * @param {*} angle  当前角度
     * @param {*} startAngle  开始角度
     * @param {*} endAngle  结束角度
     */
    _isInAngleRange(angle, startAngle, endAngle) {
        function adjust(angle) {
            while (angle < 0) {
                angle += 2 * Math.PI;
            }
            while (angle > 2 * Math.PI) {
                angle -= 2 * Math.PI;
            }

            return angle;
        }
        angle = adjust(angle);
        startAngle = adjust(startAngle);
        endAngle = adjust(endAngle);
        if (startAngle > endAngle) {
            endAngle += 2 * Math.PI;
            if (angle < startAngle) {
                angle += 2 * Math.PI;
            }
        }

        return angle >= startAngle && angle <= endAngle;
    }
    
}

export default BarHandle;