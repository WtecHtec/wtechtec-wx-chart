import { CONFIG } from './config'
import  DrawUtil  from '../../utils/draw-util'
import  ToolUtil  from '../../utils/tool-util'
import MyScaleLinear from '../../scale/scale-linear'
import  MyScaleOrdinal from '../../scale/scale-ordinal'
const WORD_WIDTH = 30
class BarHandle {

    constructor(ctx){
        try {
            if (!(ctx)) throw '画布实例对象错误！'

            this.ctx = ctx
            this.config = {}

            this.drawUtil =  new DrawUtil(ctx)
            this.toolUtil = new ToolUtil()

            this.yLeftScale = {}
            this.yRightScale = {}

            this.yLeftAxisConfig = null
            this.yRightAxisConfig = null
            
            this.leftMinVal = 0
            this.rightMinVal = 0

            this.leftMaxVal = 0
            this.rightMaxVal = 0
        } catch (e) {
            console.error(e)
        }
    }
    setOption(config) {
        this.config =  Object.assign(CONFIG, config)
        if (!Array.isArray( this.config.yAxis)) {
            console.error('yAxis 不是一个数组')
            return 
        }
        this._setAxis()
        this._getMinAndMaxValue()
        this._setYScale()
        this._setTick()
    }
    _setAxis(){
        if ( this.config.length >= 2) {
            this.yRightAxisConfig =  this.config.yAxis[1]
        }
        this.yLeftAxisConfig =  this.config.yAxis[0]
    }
    _getMinAndMaxValue(){
     
        if (!this.config.series || !this.config.series.bar || !Array.isArray(this.config.series.bar)) {
            console.error('series bar 配置有误')
            return
        }
        let barData = []
        
        this.config.series.bar.forEach((item)=>{
            barData = [...barData, ...item.data]
        })
        this.leftMinVal = Math.min(...barData)
        this.leftMaxVal = Math.max(...barData)

        if(!this.config.series.line || !Array.isArray(this.config.series.line)) {
            console.error('series line 配置有误')
            return
        }

        barData = []
        this.config.series.line.forEach((item)=>{
            barData = [...barData, ...item.data]
        })
        this.rightMinVal = Math.min(...barData)
        this.rightMaxVal = Math.max(...barData)

    }
    _setYScale() {
        let minH = this.config.grid.top
        let maxH = this.config.height - this.config.grid.top -  this.config.grid.bottom
        if(!this.yLeftAxisConfig) return
        this.leftMinVal = this.yLeftAxisConfig.min !== undefined ?  this.yLeftAxisConfig.min : this.leftMinVal
        this.leftMaxVal = this.yLeftAxisConfig.max !== undefined ?  this.yLeftAxisConfig.max : this.leftMaxVal
        this.yLeftScale = new MyScaleLinear()
                            .domain(
                                [
                                    this.leftMinVal   ,
                                    this.leftMaxVal
                                ]  )
                            .range([
                                maxH,
                                minH
                            ])   
        if(!this.yRightAxisConfig) return
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
    _setTick() {

        if(this.config.ticks < 2) {
            this.config.ticks = 2
        }
        let  ticks = this.config.ticks
        for(let i = 0; i < ticks ; i++) {
            console.log( this.yLeftScale(this.leftMinVal  )  )
            this.drawUtil.drawLineVertical(
                this.config.grid.left + WORD_WIDTH,
                this.config.width - this.config.grid.left - this.config.grid.right - (this.config.yAxis.length >= 2 ? WORD_WIDTH : 0), 
                this.yLeftScale(this.leftMaxVal /ticks * i + this.leftMinVal) ,
                0,
                {
                    lineWidth:2
                } );
            this.drawUtil.drawWord( 
                this.toolUtil.ChangeUnit(this.leftMaxVal/ticks*i + this.leftMinVal) , 
                this.config.grid.left , 
                this.yLeftScale(this.leftMaxVal/ticks*i + this.leftMinVal))
        }

    }
    getOption() {
        return this.config
    }
}

export default BarHandle;