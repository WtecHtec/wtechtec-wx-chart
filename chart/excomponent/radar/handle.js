import { CONFIG } from './config'
import DrawUtil  from '../../utils/draw-util'
import ToolUtil from '../../utils/tool-util'
import MyScaleRound from '../../scale/scale-round'
import MyScaleLinear from '../../scale/scale-linear'
import { COLOR } from '../../utils/color'
import AnimationTool from '../../utils/animation-tool'
class RadarHandle {

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

            this.lineWidth = 1

            this.scaleRound = {}

            this.ticksRound = {}

            this.scaleLinearDatas = []


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
        this._setScale()
       
        new AnimationTool({
          duration: 1000,
          timing: 'linear',
          onProcess: (process) => {
            // console.log(' AnimationTool res', process)
            this._setAngleDatas()

            this._setTicks()

            this._drawRadar(process)

            this.drawUtil.ctx.draw()
            // this.drawUtil.ctx.restore()
          }
        }).start()
       
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
        this.ticks = this.config.ticks || 3

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

    _setScale(){
      let len =  this.config.radar.length
      this.scaleRound = new MyScaleRound().domain([
          len
      ]).rangeRoundBands([
          0,
          Math.PI * 2
      ])

      this.ticksRound = new MyScaleRound().domain([
          this.ticks
      ]).rangeRoundBands([
          0,
          this.radius / 2
      ])
    }
    /**
     * 设置数据
     */
    _setAngleDatas() {

        if ( !this.config.radar) {
            console.error('series 配置错误')
            return
        }

        let len =  this.config.radar.length
        // this.scaleRound = new MyScaleRound().domain([
        //     len
        // ]).rangeRoundBands([
        //     0,
        //     Math.PI * 2
        // ])

        // this.ticksRound = new MyScaleRound().domain([
        //     this.ticks
        // ]).rangeRoundBands([
        //     0,
        //     this.radius / 2
        // ])

        let itemScaleLiner = {}
        let x = 0
        let y = 0
        let posData = []
        for (let i = 0; i < len; i ++) {

            itemScaleLiner = new MyScaleLinear().domain(
                [
                    0,
                    this.config.radar[i].max
                ]
            ).range([0, this.radius/2])

            this.scaleLinearDatas.push(itemScaleLiner)

            this.config.radar[i].angle = - Math.PI * 0.5 + this.scaleRound.getRangeBand(i)

            x =  this._getPos(this.centerX, this.config.radar[i].angle, this.radius/2, 1)
            y =  this._getPos(this.centerY, this.config.radar[i].angle, this.radius/2, 0)
            
            posData.push({
                x,
                y,
            })
            
            x = x < this.centerX ? x - this.toolUtil.MeasureTextWidth(this.config.radar[i].name) - 5 : x + 5
            y = y >  this.centerY ? y + 5 : y 

            this.drawUtil.drawWord(
                this.config.radar[i].name,
                x,
                y,
            )

            
            
        }
        
    }

    /**
     *  绘制框
     */
    _setTicks(){
        let x = 0
        let y = 0
        let posData = []
        let len =  this.config.radar.length
        console.log(this.ticksRound.getRangeBand(4) )
        for (let j = 0; j < this.ticks; j++) {
            posData = []
            for (let i = 0; i < len; i ++) {
                x =  this._getPos(this.centerX, this.config.radar[i].angle,  this.ticksRound.getRangeBand(j + 1), 1)
                y =  this._getPos(this.centerY, this.config.radar[i].angle,  this.ticksRound.getRangeBand(j + 1), 0)
            
                posData.push({
                    x,
                    y,
                })
                if (j === this.ticks - 1) {
                    this.drawUtil.drawLine(
                        {
                            x: this.centerX,
                            y: this.centerY
                        },
                        {
                            x,
                            y,
                        },
                        {
                            strokeStyle: 'rgba(245,246,250,1)'
                        }
                    )
                }
            }

            this.drawUtil.drawArea(posData[0], posData, 0, {
                strokeStyle: 'rgba(245,246,250,1)'
            })
           
        }    
        
    }
  
    /**
     *  绘制数据
     */
    _drawRadar(process){
        if ( !this.config.series || !Array.isArray(this.config.series.data)) {
            console.error('series 配置错误')
            return
        }

        let len = this.config.series.data.length
        let radarData = []
        let itemScaleLiner = {}
        let x = 0
        let y = 0
        let posData = []
        // this.drawUtil.ctx.scale(1 ,  0.5 + 0.5 * process)
        for (let i = 0; i < len; i++) {
            radarData = this.config.series.data[i].value
            posData = []
            for (let j = 0; j < radarData.length; j++) {
                if (j < this.scaleLinearDatas.length) {
                    itemScaleLiner =  this.scaleLinearDatas[j]
                    x =  this._getPos(this.centerX, this.config.radar[j].angle, itemScaleLiner(radarData[j]) * process, 1)
                    y =  this._getPos(this.centerY, this.config.radar[j].angle,  itemScaleLiner(radarData[j]) * process, 0)
            
                } else {
                    x = this.centerX
                    y = this.centerY
                }

                posData.push({
                    x,
                    y,
                })
                this.drawUtil.drawArc(
                    x,
                    y,
                    1,
                    0, Math.PI * 2, 1
                )
                
            }
            this.drawUtil.ctx.setGlobalAlpha(0.5)
            this.drawUtil.drawArea(posData[0], posData, 1, {
                lineWidth: 2,
                fillStyle:  COLOR[i % COLOR.length],
                strokeStyle: COLOR[i % COLOR.length],
            })
           
        }
       

    }




  
    
}

export default RadarHandle;