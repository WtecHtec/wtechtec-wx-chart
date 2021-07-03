import { CONFIG } from './config'
import DrawUtil  from '../../utils/draw-util'
import ToolUtil from '../../utils/tool-util'
import MyScaleRound from '../../scale/scale-round'
import MyScaleLinear from '../../scale/scale-linear'
import { COLOR } from '../../utils/color'
class GuageHandle {

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
            this.toolUtil = new ToolUtil()
            

            this.currentIndex = -1
            this.currentTapData = []

            this.floatTime = null

            this.radius = 5
            this.ticks = 2


            this.centerX = 10
            this.centerY = 10

            this.minVal = 0
            this.maxVal = 100

            this.linearScale = {}
            this.roundScale = {}
            this.axisTickRoundScale = {}



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



        this._getMinAndMaxVal()

        this._setScale()
        
        this._setTicks()

        this._drawGuage()

       

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
        if (this.floatTime) clearTimeout(this.floatTime)
      
        
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
        this.radius *= this.config.radius
        this.ticks = this.config.ticks || 4
        

    }


    _getMinAndMaxVal(){
        if (this.config.min) {
            this.minVal = this.config.min
        }

        if (this.config.max) {
            this.maxVal = this.config.max
        } 

    }

    _setScale(){

        this.linearScale = new MyScaleLinear().domain([
            this.minVal,
            this.maxVal,
        ]).range([
            this.config.startAngle / 180 * Math.PI,
            this.config.endAngle / 180 * Math.PI,
        ])

       
        if ( this.config.axisTick && this.config.axisTick.show && Array.isArray(this.config.axisTick.lineStyle) ) {
            this.axisTickRoundScale = new MyScaleRound()
                                        .domain([this.config.axisTick.lineStyle.length])
                                        .rangeRoundBands([
                                            this.config.startAngle / 180 * Math.PI,
                                            this.config.endAngle / 180 * Math.PI,
                                        ])
        }

        this.roundScale = new  MyScaleRound()
                            .domain([ this.ticks ])
                            .rangeRoundBands([
                                this.minVal,
                                this.maxVal,
                            ])
        


    }

    /**
     *  
     * 
     * 
     * 圆点坐标：(x0,y0) 
    *   半径：r 
    *   角度：a0 
    *
    *   则圆上任一点为：（x1,y1） 
    *   x1   =   x0   +   r   *   cos(ao   *   3.14   /180   ) 
    *   y1   =   y0   +   r   *   sin(ao   *   3.14   /180   ) 
    *  
    */
    /** 
    * @param {*} pos  圆中心坐标
    * @param {*} angle  角度
    * @param {*} r  圆半径
    * @param {*} isX  是不是求x坐标，否则求Y坐标
    */

    _getPos(pos,angle, r, isX) {
        if (isX) return pos +  r * Math.cos(angle)
        return pos +  r * Math.sin(angle )
    } 


    /**
     *  绘制框
     */
    _setTicks(){
        if ( this.config.axisTick && this.config.axisTick.show && Array.isArray(this.config.axisTick.lineStyle) ) {

            let lineStyles = this.config.axisTick.lineStyle
            let len = lineStyles.length

            for (let i = 0; i < len; i++) {
                this.drawUtil.drawArc(
                    this.centerX,
                    this.centerY,
                    this.radius / 2,
                    this.config.startAngle / 180 * Math.PI +  this.axisTickRoundScale.getRangeBand(i) + (i === 0 ? 0: 0.005),
                    this.config.startAngle / 180 * Math.PI + this.axisTickRoundScale.getRangeBand(i + 1),
                    1,
                    {
                        lineWidth: this.config.lineWidth,
                        strokeStyle: lineStyles[i]
                    }
                )
            }

        } else {

            this.drawUtil.drawArc(
                this.centerX,
                this.centerY,
                this.radius / 2,
                this.config.startAngle / 180 * Math.PI,
                this.config.endAngle / 180 * Math.PI,
                1,
                {
                    lineWidth: this.config.lineWidth,
                    strokeStyle: 'rgba(245,246,250,1)'
                }
            )

        }

        let angle = 0
        let x = 0
        let y  = 0
        for(let i = 0; i <= this.ticks ; i++) {
            angle = this.linearScale( this.roundScale.getRangeBand(i))
            x =  this._getPos(this.centerX, angle, this.radius / 2 * 0.8, 1)
            y = this._getPos(this.centerY,  angle, this.radius / 2 * 0.8, 0)
            this.drawUtil.drawWord(
                Math.floor(this.roundScale.getRangeBand(i)),
                x > this.centerX ?  x - this.toolUtil.MeasureTextWidth(Math.floor(this.roundScale.getRangeBand(i))) : x,
                y > this.centerY ?  y - 5 : y,
            )
            
        }
        
   
        
    }
  
    /**
     *  绘制数据
     */
    _drawGuage(){
      
        if ( !this.config.series || !Array.isArray(this.config.series.data)) {
            console.error(' series 配置错误')
            return
        }
        let guageData = this.config.series.data
        let len = guageData.length
        let isColor = true
        if ( this.config.axisTick && this.config.axisTick.show && Array.isArray(this.config.axisTick.lineStyle) )  isColor = false
        for (let i = 0; i < len; i++) {
            this.drawUtil.drawArc(
                this.centerX,
                this.centerY,
                this.radius / 2,
                this.config.startAngle / 180 * Math.PI,
                this.linearScale(guageData[i].value),
                1,
                {
                    lineWidth: this.config.lineWidth,
                    strokeStyle: isColor ? guageData[i].color : 'rgba(0,0,0,0)'
                }
            )
            this._drawCustor(
                this._getPos(this.centerX,  this.linearScale(guageData[i].value), this.radius / 2 * 0.8, 1),
                this._getPos(this.centerY,  this.linearScale(guageData[i].value), this.radius / 2 * 0.8, 0),
                this.linearScale(guageData[i].value)
            )
        }

    }
    
    /**
     * 绘制光标
     * @param { } x  顶点 x 坐标
     * @param {*} y 顶点 y 坐标
     * @param {*} angle  度数
     */
    _drawCustor(x ,y, angle) {
        let posData = []
       
        let radius = 5
        console.log('_drawCustor',  this.centerY, this._getPos(this.centerX, angle - Math.PI * 0.5 , radius, 0))
        posData.push({
            x: this.centerX,
            y:   this.centerY
        })
        posData.push({
            x: this._getPos(this.centerX, angle - Math.PI * 0.5, radius, 1),
            y: this._getPos(this.centerY, angle - Math.PI * 0.5 , radius, 0)
        })
        posData.push({
            x,
            y
        })
        posData.push({
            x: this._getPos(this.centerX, angle + Math.PI * 0.5, radius, 1),
            y: this._getPos(this.centerY, angle + Math.PI * 0.5 , radius , 0) 
        })

        this.drawUtil.drawArea(
            posData[0], posData, 1, {
                 fillStyle: '#5470c6'
               }
        )
        this.drawUtil.drawArc(
            this.centerX,
           this.centerY,
           radius,
           0, Math.PI * 2, 0,
           {
            fillStyle: '#5470c6'
           }
       )
       



    }



  
    
}

export default GuageHandle;