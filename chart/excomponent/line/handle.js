import { CONFIG } from './config'
import DrawUtil  from '../../utils/draw-util'
import ToolUtil  from '../../utils/tool-util'
import MyScaleLinear from '../../scale/scale-linear'
import MyScaleRound from '../../scale/scale-round'
import { COLOR } from '../../utils/color'
const WORD_WIDTH = 30
const SPACING = 8

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
            this.toolUtil = new ToolUtil()

        

            this.yRightScale = {}
            this.xScale = {}
            

            this.yRightAxisConfig = null
       

            this.rightMinVal = 0
            this.rightMaxVal = 0
            
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
        if (!Array.isArray( this.config.yAxis)) {
            console.error('yAxis 不是一个数组')
            return 
        }
        this._setAxis()
        this._getMinAndMaxValue()
        this._setYScale()
        this._setYTick()
        this._setXTicks()

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
        if (x < this.config.grid.left + WORD_WIDTH) return
        if (x > this.config.width - this.config.grid.right -  (this.config.yAxis.length >= 2 ? WORD_WIDTH : 0 ) ) return
        if (y < this.config.grid.top) return
        if (y > this.config.height - this.config.grid.bottom) return
  
        this.currentIndex = this._getTapIndex(x)
        if (this.currentIndex !== -1) {
            this.currentTapData = []
            this._drawFloatRect()
            this._getTapData()
            // console.log(' bindTap', this.currentTapData)
            this.$app.floatData = this.currentTapData
            this.$app.setData({
                floatData: this.$app.floatData,
                floatShow: true,
            })
            return this.currentTapData
        }
        return []
    }
    
    _getTapIndex(x) {
        let len =  this.config.xAxis.data.length
        for(let i = 0; i < len; i++) {
           if (x <=  this.config.grid.left + WORD_WIDTH + this.xScale.getRangeBand(i) + this.xScale.rangeBand()) {
               return i
           }
        }
        return -1
    }

    _getTapData() {

 
        let lineData = this.config.series.line
        for (let i = 0; i < lineData.length; i++) {
            this.currentTapData.push({
                name:  lineData[i].name,
                value: lineData[i].data[this.currentIndex]
            })
        }
        

    }

    _drawFloatRect() {
        if (this.floatTime) clearTimeout(this.floatTime)
        this.floatTime = setTimeout(() => {
            this.floatctx && this.floatctx.draw()
            this.$app.setData({
                floatShow: false,
            })
        }, 2000);
        this.floatdrawUtil.drawRect(
            this.config.grid.left + WORD_WIDTH + this.xScale.getRangeBand(this.currentIndex),
            this.config.grid.top,
            this.xScale.rangeBand() - SPACING,
            this.config.height - this.config.grid.top - this.config.grid.bottom  - this.config.grid.top,
            {
                fillColor: 'rgba(245,246,250,0.6)'
            } 
        )
        this.floatctx.draw()
    }


    _setAxis(){
        if ( ! Array.isArray(this.config.yAxis) ) {
            console.error('yAxis 配置有误')
            return
        }
        this.yRightAxisConfig =  this.config.yAxis[0]

       
    }
    _getMinAndMaxValue(){
        let barData = []
        this.config.series.line.forEach((item)=>{
            barData = [...barData, ...item.data]
        })
        this.rightMinVal = Math.min(...barData)
        this.rightMaxVal = Math.max(...barData)

    }
    _setYScale() {
        let minH = this.config.grid.top
        let maxH = this.config.height - this.config.grid.top -  this.config.grid.bottom
  
 
        
        let minW = this.config.grid.left + WORD_WIDTH
        let maxW = this.config.width - this.config.grid.right  - ( this.config.yAxis.length >= 2 ? WORD_WIDTH : 0 )
        this.xScale = new MyScaleRound()
                        .domain([
                            this.config.xAxis.data.length
                        ])
                        .rangeRoundBands([
                            minW,
                            maxW
                        ])


        this.rightMinVal = this.yRightAxisConfig.min !== undefined ?  this.yRightAxisConfig.min : this.rightMinVal
        this.rightMaxVal = this.yRightAxisConfig.max !== undefined ?  this.yRightAxisConfig.max : this.rightMaxVal
        
        this.yRightScale = new MyScaleLinear()
                            .domain(
                                [
                                    this.rightMinVal,
                                    this.rightMaxVal
                                ]  )
                            .range([
                                maxH,
                                minH
                            ])    
                            
                            
    }
    _setYTick() {

        if(this.config.ticks < 2) {
            this.config.ticks = 2
        }
        let  ticks = this.config.ticks
        for(let i = 0; i < ticks ; i++) {

            this.drawUtil.drawLineVertical(
                this.config.grid.left + WORD_WIDTH,
                this.config.width - this.config.grid.left - this.config.grid.right - (this.config.yAxis.length >= 2 ? WORD_WIDTH : 0), 
                i === 0 ?  this.yRightScale(this.rightMinVal)  :  this.yRightScale( this.rightMinVal + (  this.rightMaxVal  - this.rightMinVal)/ticks * i ),
                0,
                {
                    lineWidth:2
                }
            );
                
            this.drawUtil.drawWord( 
                this.toolUtil.ChangeUnit(i === 0 ? this.rightMinVal : ( this.rightMinVal + (  this.rightMaxVal  - this.rightMinVal)/ticks * i)) , 
                this.config.grid.left , 
                i === 0 ?  this.yRightScale(this.rightMinVal)  :  this.yRightScale( this.rightMinVal + (  this.rightMaxVal  - this.rightMinVal)/ticks * i )
            )
                    
        
        }
    


    }

    _setXTicks() {
        let len =  this.config.xAxis.data.length
        for(let i = 0; i < len; i++) {
            // + this.xScale.rangeBand()/ 2 - this.toolUtil.MeasureTextWidth(this.config.xAxis.data[i])/2
            this.drawUtil.drawWord( 
                this.config.xAxis.data[i] , 
                this.config.grid.left + WORD_WIDTH + this.xScale.getRangeBand(i)  + this.xScale.rangeBand()/ 2 - this.toolUtil.MeasureTextWidth(this.config.xAxis.data[i])/2, 
                this.config.height - this.config.grid.bottom + 5
            )

        }
     
        this._setLine()
    }

    

    _setLine(){
        if ( !this.config.series || !this.config.series.line) {
            console.error(' bar 数据有误')
            return
        }  
        let lineData =  this.config.series.line
        let lineLen = lineData.length 
        
        let lastPos = {}
        for (let i = 0; i < lineLen; i++) {
            
            for (let j = 0; j < lineData[i].data.length; j++) {

                this.drawUtil.drawArc(
                    this.config.grid.left + WORD_WIDTH + this.xScale.getRangeBand(j) + this.xScale.rangeBand() / 2,
                    this.yRightScale(lineData[i].data[j]),
                    2, 0, Math.PI * 2, 1
                )

                
                if ( j !== 0) {
                    this.drawUtil.drawLine(
                        lastPos,
                        {
                            x:  this.config.grid.left + WORD_WIDTH + this.xScale.getRangeBand(j) + this.xScale.rangeBand() / 2,
                            y:  this.yRightScale(lineData[i].data[j]),
                        },
                        {
                            fillColor: COLOR[i],
                            lineWidth: 0.5
                        }
                    )
                }
                lastPos = {
                    x:  this.config.grid.left + WORD_WIDTH + this.xScale.getRangeBand(j) + this.xScale.rangeBand() / 2,
                    y: this.yRightScale(lineData[i].data[j]),
                }

            }

        }

    }

    

    
}

export default BarHandle;