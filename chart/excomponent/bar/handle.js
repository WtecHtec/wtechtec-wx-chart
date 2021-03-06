import { CONFIG } from './config'
import DrawUtil from '../../utils/draw-util'
import ToolUtil from '../../utils/tool-util'
import MyScaleLinear from '../../scale/scale-linear'
import MyScaleRound from '../../scale/scale-round'
import { COLOR } from '../../utils/color'
import AnimationTool from '../../utils/animation-tool'
const WORD_WIDTH = 30
const SPACING = 8
class BarHandle {

  constructor(ctx, floatctx, self) {
    try {
      if (!(ctx)) throw '画布实例对象错误！'

      this.floatctx = floatctx

      this.$app = self
      this.$app.floatShow = false
      this.$app.floatData = []

      this.ctx = ctx
      this.config = {}

      this.floatdrawUtil = new DrawUtil(floatctx)
      this.drawUtil = new DrawUtil(ctx)
      this.toolUtil = new ToolUtil()

      this.yLeftScale = {}
      this.yRightScale = {}
      this.xScale = {}


      this.yLeftAxisConfig = null
      this.yRightAxisConfig = null

      this.leftMinVal = 0
      this.leftMaxVal = 0

      this.rightMinVal = 0
      this.rightMaxVal = 0

      this.currentIndex = -1
      this.currentTapData = []

      this.floatTime = null

      this.stackDataMap = {}


    } catch (e) {
      console.error(e)
    }
  }

  /**
   *  设置图表数据
   * @param { } config 
   */
  setOption(config) {
    this.config = Object.assign(CONFIG, config)
    if (!Array.isArray(this.config.yAxis)) {
      console.error('yAxis 不是一个数组')
      return
    }
    this._setAxis()
    this._getMinAndMaxValue()
    this._setYScale()
    // let targetPos = []
    // if (this.config.series.line) {
    //   targetPos = this._setLineDatas()
    // }
    new AnimationTool({
      duration: 1000,
      timing: 'linear',
      onProcess: (process) => {
        // console.log(' AnimationTool res', process)
        this._setYTick()
        this._setXTicks()
        this._setBarRect(process)
        if (this.config.series.line) {
          // this._setLineArc()
          // this._setLineNew(targetPos, process)
          this._setLine(process)
        }
        this.drawUtil.ctx.draw()
        // this.drawUtil.ctx.restore()
      }
    }).start()


    // this.drawUtil.ctx.restore()
    // this.drawUtil.ctx.draw()
    // this.drawUtil.ctx.save()
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
    if (x > this.config.width - this.config.grid.right - WORD_WIDTH) return
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
    let len = this.config.xAxis.data.length
    for (let i = 0; i < len; i++) {
      if (x <= this.config.grid.left + WORD_WIDTH + this.xScale.getRangeBand(i) + this.xScale.rangeBand()) {
        return i
      }
    }
    return -1
  }

  _getTapData() {

    let barData = this.config.series.bar
    for (let i = 0; i < barData.length; i++) {
      this.currentTapData.push({
        name: barData[i].name,
        value: barData[i].data[this.currentIndex]
      })
    }

    if (this.config.yAxis && this.config.yAxis.length >= 2) {
      let lineData = this.config.series.line
      for (let i = 0; i < lineData.length; i++) {
        this.currentTapData.push({
          name: lineData[i].name,
          value: lineData[i].data[this.currentIndex]
        })
      }
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
      this.config.height - this.config.grid.top - this.config.grid.bottom - this.config.grid.top,
      {
        fillColor: 'rgba(245,246,250,0.6)'
      }
    )
    this.floatctx.draw()
  }


  _setAxis() {
    if (!Array.isArray(this.config.yAxis)) {
      console.error('yAxis 配置有误')
      return
    }
    if (this.config.yAxis && this.config.yAxis.length >= 2) {
      this.yRightAxisConfig = this.config.yAxis[1]
    }
    this.yLeftAxisConfig = this.config.yAxis[0]


  }

  /**
   *  添加 stack 柱状图
   */
  _getStackMinAndMaxValue() {

    this.config.series.bar.forEach((item, index) => {
      if (item.stack && !this.stackDataMap[item.stack]) {
        this.stackDataMap[item.stack] = [item.data];
      } else if (item.stack && this.stackDataMap[item.stack]) {
        this.stackDataMap[item.stack].push(item.data)
      } else {
        this.stackDataMap[new Date().getTime() + index] = [item.data];
      }
    })
    let barData = []
    let stackArr = []
    let itemStack = 0
    for (let key in this.stackDataMap) {
      console.log('_getStackMinAndMaxValue', key)
      stackArr = []
      if (this.stackDataMap[key].length >= 2) {

        for (let j = 0; j < this.config.xAxis.data.length; j++) {
          itemStack = 0
          for (let i = 0; i < this.stackDataMap[key].length; i++) {
            itemStack += this.stackDataMap[key][i][j]
          }
          stackArr.push(itemStack)
        }

        barData = barData.concat(stackArr)

      } else {
        barData = barData.concat(...this.stackDataMap[key])
      }
    }



    console.log('_getStackMinAndMaxValue', this.stackDataMap, barData)
    return barData
  }

  _getMinAndMaxValue() {

    if (!this.config.series || !this.config.series.bar || !Array.isArray(this.config.series.bar)) {
      console.error('series bar 配置有误')
      return
    }
    let barData = []

    // this.config.series.bar.forEach((item)=>{
    //     barData = [...barData, ...item.data]
    // })

    barData = this._getStackMinAndMaxValue()

    this.leftMinVal = Math.min(...barData)
    this.leftMaxVal = Math.max(...barData)

    if (!this.config.series.line || !Array.isArray(this.config.series.line)) {
      console.error('series line 配置有误')
      return
    }

    barData = []
    this.config.series.line.forEach((item) => {
      barData = [...barData, ...item.data]
    })
    this.rightMinVal = Math.min(...barData)
    this.rightMaxVal = Math.max(...barData)

  }
  _setYScale() {
    let minH = this.config.grid.top
    let maxH = this.config.height - this.config.grid.top - this.config.grid.bottom
    if (!this.yLeftAxisConfig) return
    this.leftMinVal = this.yLeftAxisConfig.min !== undefined ? this.yLeftAxisConfig.min : this.leftMinVal
    this.leftMaxVal = this.yLeftAxisConfig.max !== undefined ? this.yLeftAxisConfig.max : this.leftMaxVal
    this.yLeftScale = new MyScaleLinear()
      .domain(
        [
          this.leftMinVal,
          this.leftMaxVal
        ])
      .range([
        maxH,
        minH
      ])

    let minW = this.config.grid.left + WORD_WIDTH
    let maxW = this.config.width - this.config.grid.right - (this.config.yAxis.length >= 2 ? WORD_WIDTH : 0)
    this.xScale = new MyScaleRound()
      .domain([
        this.config.xAxis.data.length
      ])
      .rangeRoundBands([
        minW,
        maxW
      ])

    if (!this.yRightAxisConfig) return

    this.rightMinVal = this.yRightAxisConfig.min !== undefined ? this.yRightAxisConfig.min : this.rightMinVal
    this.rightMaxVal = this.yRightAxisConfig.max !== undefined ? this.yRightAxisConfig.max : this.rightMaxVal

    this.yRightScale = new MyScaleLinear()
      .domain(
        [
          this.rightMinVal,
          this.rightMaxVal
        ])
      .range([
        maxH,
        minH
      ])


  }
  _setYTick(process) {

    if (this.config.ticks < 2) {
      this.config.ticks = 2
    }
    let ticks = this.config.ticks
    for (let i = 0; i < ticks; i++) {
      this.drawUtil.drawLineVertical(
        this.config.grid.left + WORD_WIDTH,
        this.config.width - this.config.grid.left - this.config.grid.right - (this.config.yAxis.length >= 2 ? WORD_WIDTH : 0),
        i === 0 ? this.yLeftScale(this.leftMinVal) : this.yLeftScale(this.leftMinVal + (this.leftMaxVal - this.leftMinVal) / ticks * i),
        0,
        {
          lineWidth: 2
        });

      this.drawUtil.drawWord(
        this.toolUtil.ChangeUnit(i === 0 ? this.leftMinVal : (this.leftMinVal + (this.leftMaxVal - this.leftMinVal) / ticks * i)),
        this.config.grid.left,
        i === 0 ? this.yLeftScale(this.leftMinVal) : this.yLeftScale(this.leftMinVal + (this.leftMaxVal - this.leftMinVal) / ticks * i)
      )

      if (this.yRightAxisConfig) {

        this.drawUtil.drawWord(
          this.toolUtil.ChangeUnit(i === 0 ? this.rightMinVal : (this.rightMinVal + (this.rightMaxVal - this.rightMinVal) / ticks * i)),
          this.config.width - this.config.grid.left - this.config.grid.right - (this.config.yAxis.length >= 2 ? WORD_WIDTH : 0) + WORD_WIDTH / 2,
          i === 0 ? this.yRightScale(this.rightMinVal) : this.yRightScale(this.rightMinVal + (this.rightMaxVal - this.rightMinVal) / ticks * i)
        )
      }
    }



  }

  _setXTicks() {
    let len = this.config.xAxis.data.length
    for (let i = 0; i < len; i++) {
      // + this.xScale.rangeBand()/ 2 - this.toolUtil.MeasureTextWidth(this.config.xAxis.data[i])/2
      this.drawUtil.drawWord(
        this.config.xAxis.data[i],
        this.config.grid.left + WORD_WIDTH + this.xScale.getRangeBand(i) + this.xScale.rangeBand() / 2 - this.toolUtil.MeasureTextWidth(this.config.xAxis.data[i]) / 2,
        this.config.height - this.config.grid.bottom + 5
      )

    }
    // this._setLine()
  }


  _setBarRect(process) {
    if (!this.config.series || !this.config.series.bar) {
      console.error(' bar 数据有误')
      return
    }
    let barData = this.config.series.bar
    // let barLen = barData.length 
    let stackMapKeys = Object.keys(this.stackDataMap)
    let barLen = stackMapKeys.length
    let rangeBand = (this.xScale.rangeBand() - SPACING) / barLen

    // for(let i = 0; i < barLen; i++ ) {
    //     for (let j = 0; j < barData[i].data.length; j++ ) {   
    //         this.drawUtil.drawRect(
    //             this.config.grid.left + WORD_WIDTH + this.xScale.getRangeBand(j) + rangeBand * i,
    //             this.yLeftScale(barData[i].data[j]),
    //             rangeBand,
    //             this.config.height  - this.config.grid.bottom  - this.config.grid.top -  this.yLeftScale(barData[i].data[j]),
    //             {
    //                 fillColor: COLOR[i]
    //             }
    //         );
    //     }
    // }


    let yScaleVale = new Array(this.config.xAxis.data.length).fill(0)
    let colorIndex = 0
    for (let i = 0; i < barLen; i++) {

      if (this.stackDataMap[stackMapKeys[i]].length === 0) break

      yScaleVale = new Array(this.config.xAxis.data.length).fill(0)

      if (this.stackDataMap[stackMapKeys[i]].length >= 2) {

        for (let j = 0; j < this.stackDataMap[stackMapKeys[i]].length; j++) {
          // console.log('this.stackDataMap[stackMapKeys[i]][j].length', this.stackDataMap[stackMapKeys[i]][j].length)
          for (let n = 0; n < this.stackDataMap[stackMapKeys[i]][j].length; n++) {
            //   console.log(this.stackDataMap[stackMapKeys[i]][j][n])
            this.drawUtil.drawRect(
              this.config.grid.left + WORD_WIDTH + this.xScale.getRangeBand(n) + rangeBand * i,
              this.yLeftScale(this.stackDataMap[stackMapKeys[i]][j][n]) - yScaleVale[n] + (this.config.height - this.config.grid.bottom - this.config.grid.top - this.yLeftScale(this.stackDataMap[stackMapKeys[i]][j][n])) * (1 - process),
              rangeBand,
              (this.config.height - this.config.grid.bottom - this.config.grid.top - this.yLeftScale(this.stackDataMap[stackMapKeys[i]][j][n])) * process,
              {
                fillColor: COLOR[colorIndex % COLOR.length]
              }
            );
            yScaleVale[n] += this.config.height - this.config.grid.bottom - this.config.grid.top - this.yLeftScale(this.stackDataMap[stackMapKeys[i]][j][n])
            // console.log(yScaleVale[n])
            colorIndex++;
          }


        }


      } else {

        for (let j = 0; j < this.stackDataMap[stackMapKeys[i]][0].length; j++) {

          this.drawUtil.drawRect(
            this.config.grid.left + WORD_WIDTH + this.xScale.getRangeBand(j) + rangeBand * i,
            this.yLeftScale(this.stackDataMap[stackMapKeys[i]][0][j]) + (this.config.height - this.config.grid.bottom - this.config.grid.top - this.yLeftScale(this.stackDataMap[stackMapKeys[i]][0][j])) * (1 - process),
            rangeBand,
            (this.config.height - this.config.grid.bottom - this.config.grid.top - this.yLeftScale(this.stackDataMap[stackMapKeys[i]][0][j])) * process,
            {
              fillColor: COLOR[colorIndex % COLOR.length]
            }
          );
          colorIndex++
        }

      }
    }
    // console.log(yScaleVale)


  }

  _setLineArc() {
    if (!this.config.series || !this.config.series.line) {
      console.error(' line 数据有误')
      return
    }
    let lineData = this.config.series.line
    let lineLen = lineData.length
    for (let i = 0; i < lineLen; i++) {

      for (let j = 0; j < lineData[i].data.length; j++) {

        this.drawUtil.drawArc(
          this.config.grid.left + WORD_WIDTH + this.xScale.getRangeBand(j) + this.xScale.rangeBand() / 2,
          this.yRightScale(lineData[i].data[j]),
          1, 0, Math.PI * 2, 1, {
          strokeStyle: COLOR[i]
        }
        )
      }
    }
  }
  _setLineDatas() {
    if (!this.config.series || !this.config.series.line) {
      console.error(' line 数据有误')
      return
    }
    let lineData = this.config.series.line
    let lineLen = lineData.length
    let lastPos = {}
    let targetPos = []
    let itemPos = []
    for (let i = 0; i < lineLen; i++) {
      itemPos = []
      for (let j = 0; j < lineData[i].data.length; j++) {

        if (j !== 0) {
          itemPos.push({
            lastPos: lastPos,
            currentPos: {
              x: this.config.grid.left + WORD_WIDTH + this.xScale.getRangeBand(j) + this.xScale.rangeBand() / 2,
              y: this.yRightScale(lineData[i].data[j]),
            },
          })
        }
        lastPos = {
          x: this.config.grid.left + WORD_WIDTH + this.xScale.getRangeBand(j) + this.xScale.rangeBand() / 2,
          y: this.yRightScale(lineData[i].data[j]),
        }

      }
      targetPos.push(itemPos)
    }
    // console.log('targetPos', targetPos)
    return targetPos
  }

  _setLineNew(targetPos, process) {

    for (let i = 0; i < targetPos.length; i++) {
      console.log('COLOR[i]', COLOR[i])
      for (let j = 0; j < targetPos[i].length; j++) {
        // console.log('targetPos[i][j].lastPos.y + (targetPos[i][j].currentPos.y - targetPos[i][j].lastPos.y) * process', targetPos[i][j].lastPos.y + (targetPos[i][j].currentPos.y - targetPos[i][j].lastPos.y) * process)
        this.drawUtil.drawLine(
          targetPos[i][j].lastPos,
          {
            x: targetPos[i][j].lastPos.x + (targetPos[i][j].currentPos.x - targetPos[i][j].lastPos.x) * process,
            y: targetPos[i][j].lastPos.y + (targetPos[i][j].currentPos.y - targetPos[i][j].lastPos.y) * process
          }
          ,
          {
            strokeStyle: COLOR[i],
            fillStyle: COLOR[i],
            lineWidth: 0.5
          }
        )
      }
    }

  }
  _setLine(process) {
    if (!this.config.series || !this.config.series.line) {
      console.error(' line 数据有误')
      return
    }
    let lineData = this.config.series.line
    let lineLen = lineData.length
    let lastPos = {}
    for (let i = 0; i < lineLen; i++) {

      for (let j = 0; j < lineData[i].data.length; j++) {

        this.drawUtil.drawArc(
          this.config.grid.left + WORD_WIDTH + this.xScale.getRangeBand(j) + this.xScale.rangeBand() / 2,
          this.yRightScale(lineData[i].data[j]) * process,
          2, 0, Math.PI * 2, 1, {
          strokeStyle: COLOR[i]
        }
        )


        if (j !== 0) {
          this.drawUtil.drawLine(
            lastPos,
            {
              x: this.config.grid.left + WORD_WIDTH + this.xScale.getRangeBand(j) + this.xScale.rangeBand() / 2,
              y: this.yRightScale(lineData[i].data[j]) * process,
            },
            {
              fillColor: COLOR[i],
              lineWidth: 0.5
            }
          )
        }

        lastPos = {
          x: this.config.grid.left + WORD_WIDTH + this.xScale.getRangeBand(j) + this.xScale.rangeBand() / 2,
          y: this.yRightScale(lineData[i].data[j]) * process,
        }

      }


    }

  }

}

export default BarHandle;