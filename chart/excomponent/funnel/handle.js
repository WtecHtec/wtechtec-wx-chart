import { CONFIG } from './config'
import DrawUtil  from '../../utils/draw-util'
import MyScaleLinear from '../../scale/scale-linear'
import MyScaleRound from '../../scale/scale-round'
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
       
            this.scaleLinear = {}
            this.scaleRound = {}

            this.minVal = 0
            this.maxVal = 0

            this.funnelData = []
            
            this.firstCenter = {
                x: 0,
                y: 0
            }

            this.currentIndex = -1
            this.currentTapData = []

            this.floatTime = null








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
        if ( !this.config.series || !Array.isArray(this.config.series.data)) {
            console.error('series 配置错误')
            return 
        }
        this._getMaxAndMin()
        this._setScale()
        this._drawArea()
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

        if (x < this.config.grid.left ) return
        if (x > this.config.width - this.config.grid.right ) return
        if (y < this.config.grid.top) return
        if (y > this.config.height - this.config.grid.bottom) return

        
        this.currentIndex = this._getTapIndex(y)
        console.log( this.currentIndex)
        if (this.currentIndex !== -1) {
            let result = {}
          
            result = this.config.series.data[this.currentIndex]
            this.floatdrawUtil.drawArea(result.posData[0], result.posData, 1, {
                fillStyle: 'rgba(245,246,250,0.6)'
            })
            this.floatctx.draw()
            this.floatTime = setTimeout(() => {
                this.floatctx.draw()
            }, 2000);
            return result
        }
    }

    _getTapIndex(y) {
        let len =  this.funnelData.length
        for(let i = 0; i < len; i++) {
           if (y <=  this.config.grid.top  + this.scaleRound.getRangeBand(i) + this.scaleRound.rangeBand()) {
               return  len - 1 - i
           }
        }
        return -1
    }

    _getMaxAndMin(){
        this.config.series.data.sort( (a, b)=>{
            return  a.value - b.value 
        })
        for (let i = 0; i < this.config.series.data.length; i++) {
            this.funnelData.push(this.config.series.data[i].value)
        }
        this.maxVal = Math.max(...this.funnelData)
        this.minVal = Math.min(...this.funnelData)
       
    }
    _setScale() {

        let w = this.config.width - this.config.grid.left - this.config.grid.right
        let h = this.config.height - this.config.grid.top - this.config.grid.bottom
        this.scaleRound = new MyScaleRound().domain([
            this.funnelData.length
        ]).rangeRoundBands([
            0,
            h
        ])

        this.scaleLinear = new MyScaleLinear().domain([
            0,
            this.funnelData.length
        ]).range([
            0,
            w
        ])

 
        this.firstCenter = {
            x: this.config.grid.left +  w/2,
            y: this.config.width - this.config.grid.bottom
        }
    }
   

    _drawArea() {
        let len = this.funnelData.length
        let pos = []
        let colorLen = COLOR.length
        let h = this.config.height - this.config.grid.bottom
        for(let i = 0; i < len; i++) {
            pos = []
            
            pos.push(
                {
                    x: this.firstCenter.x  -   this.scaleLinear(i)/ 2,
                    y: h - this.scaleRound.getRangeBand(i) - 2
                } 
            )

            pos.push(
                {
                    x: this.firstCenter.x  + this.scaleLinear(i)/ 2,
                    y: h - this.scaleRound.getRangeBand(i) - 2
                } 
            )
            
            pos.push(
                {
                    x: this.firstCenter.x  + this.scaleLinear(i + 1)/ 2,
                    y: h - this.scaleRound.getRangeBand(i + 1 )
                } 
            )

            pos.push(
                {
                    x: this.firstCenter.x  - this.scaleLinear(i + 1 )/ 2,
                    y: h - this.scaleRound.getRangeBand(i + 1)
                } 
            )

           
            this.drawUtil.drawArea(pos[0], pos, 1, {
                fillStyle: COLOR[i % colorLen]
            })

            this.config.series.data[i].posData = [...pos]

            
        }
        console.log('  this.funnelData:',   this.config.series.data)
    }



    
}

export default BarHandle;